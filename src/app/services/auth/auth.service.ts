import { Injectable, inject, Injector, signal } from '@angular/core';
import { Strings } from 'src/app/enum/strings';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, from, lastValueFrom, Observable, Subject, throwError } from 'rxjs';
import { Router, UrlTree } from '@angular/router';
import { map, take, tap, filter, switchMap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { ProfileService } from '../profile/profile.service';
import { GlobalService } from '../global/global.service';
import { Platform } from '@ionic/angular'; // Importe o Platform
import { PushNotifications } from '@capacitor/push-notifications'; // Importe o Plugin
import { Geolocation } from '@capacitor/geolocation'; // Importe o Geolocation
import { Address } from 'src/app/models/address.model';
import { AddressService } from '../address/address.service';
import { App } from '@capacitor/app'; // Importe o App para fechar o sistema
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthResponse } from 'src/app/interfaces/authResponse.interface';
import { User } from 'src/app/models/user.model';


@Injectable({
  providedIn: 'root',
})
export class AuthService { // Removido o 'private' do _token e _refreshToken
    private _token = signal<string | null>(null);
    private _refreshToken = signal<string | null>(null);
    readonly isRefreshingToken = signal<boolean>(false);
    readonly accessTokenSubject = new Subject<string | null>();
    public establishment = signal<any>(null);
    private lastBackPress = 0;
    private injector = inject(Injector);

    //private isPushInitialized = false;
    
    get token() {
      return this._token.asReadonly();
    }

    get refreshToken() {
      return this._refreshToken.asReadonly();
    }

  constructor(
    private router: Router,
    private addressService: AddressService,
    private storage: StorageService,
    private api: ApiService,
    private profile: ProfileService,
    private global: GlobalService,
    private platform: Platform // <--- Veja se aqui está escrito 'platform'
  ) {
    this.initializeBackButtonCustomHandler();
    this.checkAppUpdate(); // Verifica atualização assim que o serviço é iniciado
  }

  updateToken(value: string) {
    this._token.set(value);
  }

  updateRefreshToken(value: string) {
    this._refreshToken.set(value);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const data = { email, password };
      const response = await lastValueFrom(this.api.post('users/login', data)) as AuthResponse;
      
      if (response.success && response.data?.token) {
        // Mapeia os dados brutos para a instância da classe User
        const user = response.data.user ? User.fromJson(response.data.user) : undefined;
        await this.setUserData(response.data.token, response.data.refreshToken, user);
      }
      return response;
    } catch (e) {
      throw e;
    }
  }
  
  async getToken() {
    let token: string | null = this._token(); // Acessa o valor do signal
    if(!token) {
      const storedToken = await this.storage.getStorage(Strings.TOKEN);
      token = storedToken?.value ?? null;
      if (token) this.updateToken(token);
    }

    if (token && this.isTokenExpired(token)) {
      console.log('[AuthService] Token expirado detectado localmente, tentando refresh...');
      try {
        // Força o carregamento do refresh token do storage antes de prosseguir
        const refreshToken = await this.getRefreshToken();
        if (refreshToken) {
          const response = await lastValueFrom(this.getNewTokens());
          return response?.data?.token || null;
        }
        return null;
      } catch (e) {
        console.error('[AuthService] Falha ao renovar token proativamente', e);
        return null;
      }
    }

    return token;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Adiciona uma margem de segurança de 30 segundos
      return Math.floor(Date.now() / 1000) >= (payload.exp - 30);
    } catch {
      return true;
    }
  }

  /**
   * Verifica se o modal de endereço deve ser aberto.
   * Regra: Se não houver endereço ou se o usuário estiver a mais de 2km do endereço salvo.
   */
  async checkLocationContext(): Promise<boolean> {
    try {
      const savedLocation = await this.storage.getStorage(Strings.USER_LOCATION); 
      let address: Address | null = null;

      // 1. Tenta recuperar do Storage local (rápido)
      if (savedLocation?.value && savedLocation.value !== 'undefined') {
        address = JSON.parse(savedLocation.value);
        // Sincroniza o estado global com o endereço do storage para garantir coordenadas nas APIs
        if (address) {
          await this.addressService.changeAddress(address);
        }
      } else {
        // 2. Se vazio, tenta buscar o endereço salvo no banco de dados do usuário
        console.log('[AuthService] Sem endereço no storage. Buscando do banco...');
        try {
          const userAddresses = await this.addressService.getAddresses(1);
          if (userAddresses && userAddresses.length > 0) {
            address = userAddresses[0];
            console.log('[AuthService] Endereço encontrado no banco:', address);
            // Persiste no storage e atualiza o estado global para evitar novas consultas
            if (address) {
              await this.addressService.changeAddress(address);
            }
          }
        } catch (dbErr) {
          console.warn('[AuthService] Erro ao buscar endereços do servidor:', dbErr);
        }
      }

      if (!address) {
        console.log('[AuthService] Nenhum endereço disponível. Abrindo modal.');
        return true; // Abre o modal pois não há contexto algum
      }

      let coordinates;
      try {
        coordinates = await Geolocation.getCurrentPosition({ 
          timeout: 10000, 
          enableHighAccuracy: true,
          maximumAge: 300000 // 5 minutos
        });
      } catch (gpsErr) {
        // Fallback: Se a alta precisão falhar (comum em locais fechados), tenta a precisão normal
        console.warn('[AuthService] GPS alta precisão falhou, tentando modo econômico...', gpsErr);
        coordinates = await Geolocation.getCurrentPosition({ 
          timeout: 5000, 
          enableHighAccuracy: false,
          maximumAge: 600000 // 10 minutos
        });
      }
      
      if (address.lat === undefined || address.lng === undefined) {
        console.log('[AuthService] Endereço salvo não possui coordenadas (lat/lng). Ignorando cálculo de distância.');
        return false;
      }

      const distance = this.calculateDistance(
        coordinates.coords.latitude,
        coordinates.coords.longitude,
        address.lat,
        address.lng
      );

      console.log(`[AuthService] Distância do endereço salvo: ${distance.toFixed(2)}km`);

      if (distance > 2) {
        // Usuário está longe (mais de 2km)
        return new Promise((resolve) => {
          this.global.showAlert(
            `Você está a ${distance.toFixed(1)}km do endereço selecionado (${address.address}). Deseja atualizar sua localização atual?`,
            'Localização Distante',
            [
              { text: 'Manter atual', handler: () => resolve(false) },
              { text: 'Alterar agora', handler: () => resolve(true) }
            ]
          );
        });
      }

      return false; // Está dentro do raio de 2km, não abre modal
    } catch (e) {
      console.error('[AuthService] Erro ao verificar localização:', e);
      return false; // Em caso de erro de GPS, não bloqueia o usuário
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const p = 0.017453292519943295; // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p) / 2 + 
              c(lat1 * p) * c(lat2 * p) * 
              (1 - c((lng2 - lng1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // Diâmetro da Terra * asin
  }

  /**
   * Configura o comportamento do botão "Voltar" do Android
   */
  private initializeBackButtonCustomHandler() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      const currentUrl = this.router.url;
      
      // Se o usuário estiver em uma das páginas "raízes", fechamos o app
      // Adicione aqui as rotas que devem fechar o app ao apertar voltar
      if (currentUrl === '/tabs' || 
          currentUrl === Strings.LOGIN || 
          currentUrl.includes('/tabs/')) {
        
        const currentTime = new Date().getTime();
        if (currentTime - this.lastBackPress < 2000) { // Intervalo de 2 segundos
          App.exitApp();
        } else {
          this.global.successToast('Pressione novamente para sair');
          this.lastBackPress = currentTime;
        }
      }
    });
  }

  async getRefreshToken() {
    let refreshToken: string | null = this._refreshToken(); // Acessa o valor do signal
    if(!refreshToken) {
      const stored = await this.storage.getStorage(Strings.REFRESH_TOKEN);
      refreshToken = stored?.value ?? null;
      if (refreshToken) this.updateRefreshToken(refreshToken);
    }
    return refreshToken;
  }

  getNewTokens(): Observable<AuthResponse> {
    // Utilizamos 'from' para garantir que o Signal esteja populado via Storage antes do POST
    return from(this.getRefreshToken()).pipe(
      switchMap(refreshToken => {
        if (!refreshToken) return throwError(() => new Error('Refresh Token ausente.'));
        return this.api.post('users/refresh_token', { refreshToken });
      }),
      map((response: any) => {
        // Se o backend enviar sem envelope (resposta legada), normaliza para o formato esperado
        if (response && !response.data && response.accessToken) {
          return {
            success: true,
            data: {
              token: response.accessToken,
              refreshToken: response.refreshToken
            }
          };
        }
        return response;
      }),
      tap(response => {
        this.setUserData(response.data.token, response.data.refreshToken);
      })
    );
  }

  async getUser(): Promise<User | null> {
    const token = await this.getToken();
    if (!token) return null;

    try {
      // 1. Tenta recuperar do storage local (mais rápido e evita chamadas de API)
      const data = await this.storage.getStorage(Strings.USER_DATA);
      if (data?.value) {
        return User.fromJson(JSON.parse(data.value));
      }

      // 2. Se não estiver no storage, busca via ProfileService (que pode consultar a API)
      console.log('[getUser] Token encontrado, consultando perfil...');
      const user = await this.profile.getProfile();
      console.log('[getUser] Perfil obtido:', user);
      if (user) {
        // O profile.getProfile já retorna um User mapeado
        await this.storage.setStorage(Strings.USER_DATA, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (e) {
      console.error('[getUser] ERRO:', e);
      return null;
    }
  }


  isLoggedIn() {
    //return from(this.getToken());
    return this.getToken();
  }

  async register(formvalue: any): Promise<AuthResponse> {
   try {
     const data = {
       email: formvalue.email,
       phone: formvalue.phone,
       name: formvalue.name,
       type: Strings.USER_TYPE,
       status: 'active',
       password: formvalue.password
      };
      const response = await lastValueFrom(this.api.post('users/signup', data)) as AuthResponse;
      
      console.log('Registro realizado:', response);
      
      const user = response.data?.user ? User.fromJson(response.data.user) : undefined;
      await this.setUserData(response.data?.token, response.data?.refreshToken, user);
      return response;
    } catch (e) {
      throw(e)
    }
  }

  async getRole() {
    const user = await this.getUser();
    return user && typeof user === 'object' ? user.type : null;
  }

  async setUserData(token: string, refreshToken: string, user?: User) {
    this.storage.setStorage(Strings.TOKEN, token);
    this.storage.setStorage(Strings.REFRESH_TOKEN, refreshToken);
    if (user) {
      this.storage.setStorage(Strings.USER_DATA, JSON.stringify(user));
      this.updateProfileData(user);
    }
    this.updateToken(token);
    this.updateRefreshToken(refreshToken);

    // ATIVAÇÃO DO PUSH: Inicializa apenas uma vez após login ou refresh bem-sucedido
    this.initPush(); 
  }

  updateProfileData(data: User) {
    this.profile.updateProfileData(data);
  }

  async sendResetPasswordOtp(email: string) {
    try {
      const data = { email };
      const response = await lastValueFrom(this.api.get('users/send/reset/password/token', data));
      console.log(response);
      return response;
    } catch(e) {
      throw(e);
    }
  }

  async verifyResetPasswordOtp(email: string, otp: string) {
    try {
      const data = { 
        email,
        reset_password_token: otp 
      };
      const response = await lastValueFrom(this.api.get('users/verify/resetPasswordToken', data));
      console.log(response);
      return response;
    } catch(e) {
      throw(e);
    }
  }


  async resetPassword(data: any) {
      try {
      const response = await lastValueFrom(this.api.patch('users/reset/password', data));
      console.log(response);
      return response;
    } catch(e) {
      throw(e);
    }
  }

  logoutUser(nav?: boolean) {
    this.storage.removeStorage(Strings.TOKEN);
    this.storage.removeStorage(Strings.REFRESH_TOKEN);
    this.storage.removeStorage(Strings.USER_DATA);
    this.storage.removeStorage(Strings.USER_LOCATION);
    this.storage.removeStorage(Strings.USER_SOUND);
    this.storage.removeStorage('hubs_pos_tables_state');
    this._token.set(null); // Atualiza o signal
    this._refreshToken.set(null); // Atualiza o signal
    this.addressService.clearAddress();
    this.profile.updateProfileData(null);
    if(!nav) this.router.navigateByUrl(Strings.LOGIN, { replaceUrl: true });
  }

  async logout(nav?: boolean) {
    try {
      const refreshToken = await this.getRefreshToken();
      if (refreshToken) {
        // Disparamos o logout no servidor mas NÃO aguardamos (sem await) a resposta.
        // Isso evita que o app trave se o servidor estiver offline (ERR_CONNECTION_REFUSED).
        this.api.post('users/logout', { refreshToken }).subscribe({
          error: (e) => console.warn('Falha ao deslogar no backend (servidor offline?), procedendo localmente.', e)
        });
      }
    } catch (e) {
      console.error('Erro ao recuperar dados para logout:', e);
    } finally {
      // Independente de sucesso ou erro na rede, limpamos os dados locais para quebrar o loop.
      this.logoutUser(nav);
    }
  }

  otpGuard() {
    return toObservable(this.profile.profile, { injector: this.injector }).pipe(
      take(1),
      map((user: any) => {
        console.log('otp guard user: ', user);
        if(user?.email_verified) {
          return this.router.parseUrl(Strings.TABS);
        }
        return true;
      })
    );
  }

  async autoLoginGuard(): Promise<boolean | UrlTree> {
    try {
      const token = await this.getToken();
      if(token) {
        const user = await this.getUser();
        if (user) {
          return this.getRedirectUrl(user.type);
        }
      }
      return true;
    } catch(e) {
      console.error("Erro no autoLoginGuard", e);
      return true;
    }
  }

  async authGuard(route: any): Promise<boolean | UrlTree> {
    const existingRole = route.data['role'];
    try {
      const user = await this.getUser();
      console.log("[authGuard] User:", user);
      
      if(user) {
        if(user.status != 'active') {
          console.warn("[authGuard] Usuário inativo");
          this.logout();
          return false;
        }

        // Se o cargo do usuário for exatamente o que a rota pede, permitimos a passagem.
        if(user.type === existingRole) {
          console.log("[authGuard] Acesso permitido para:", user.type);
          return true;
        }

        // Se for staff (colaborador) acessando a área administrativa da adega
        if (existingRole === Strings.ADMIN_TYPE && user.type === Strings.STAFF_TYPE) {
          console.log("[authGuard] Acesso permitido para Staff na área de Admin lojista");
          return true;
        }

        // Se for super_staff (colaborador) acessando a área de super admin
        if (existingRole === Strings.SUPER_TYPE && user.type === Strings.SUPER_STAFF_TYPE) {
          console.log("[authGuard] Acesso permitido para Super Staff na área de Super Admin");
          return true;
        }

        // Se for um cargo diferente, manda ele para a home dele
        console.log("[authGuard] Cargo diferente. Redirecionando de", existingRole, "para", user.type);
        return this.getRedirectUrl(user.type);
      } 
      
      // Se não houver usuário/token, volta para o login
      console.log("[authGuard] Sem token/usuário. Redirecionando para login");
      return this.router.parseUrl(Strings.LOGIN);
    } catch(e: any) {
      console.error("[authGuard] Exceção:", e);
      this.showAlert(existingRole, e?.error?.message);
      return this.router.parseUrl(Strings.LOGIN);
    }
  }

  navigate(url: string) {
    this.router.navigateByUrl(url, { replaceUrl: true });
    return false;
  }

  showAlert(role: string, msg?: string) {
    this.global.showAlert(
      msg ? msg : 'Verifique sua conexão com a internet e tente novamente.',
      'Tentar novamente',
      [
        {
          text: 'Sair',
          handler: () => {
            this.logout();
            return false;
          }
        },
        {
          text: 'Tentar novamente',
          handler: () => {
            this.redirect(role);
          }
        }
      ]
    );
  }
  
  // MÉTODO PARA INICIALIZAR O PUSH
  async initPush() {
    // Só roda em dispositivo real (Android/iOS)
    if (this.platform.is('capacitor')) {

        // 1. Solicita permissão ao usuário
        let perm = await PushNotifications.requestPermissions();
        
        // 2. Se concedido, registra o dispositivo no APNS/FCM
        if (perm.receive === 'granted') {
            await PushNotifications.register();
        }

        // Ouve o registro e envia o Token para o seu Backend
        PushNotifications.addListener('registration', (token) => {
            console.log('FCM Token:', token.value);
            
            // Envia o token para o backend (ajustado para 'users' plural)
            this.api.patch('users/update/fcm-token', { fcm_token: token.value })
                .subscribe({
                    next: () => console.log('✅ Token vinculado com sucesso'),
                    error: (e) => console.error('❌ Erro ao salvar token:', e)
                });
        });

        // Opcional: Feedback visual com app aberto
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            if (notification.body) {
                this.global.successToast(notification.body);
            }
        });
    }
  }

  /**
  * Verifica se há uma nova versão disponível na loja.
  */
  async checkAppUpdate() {
    if (!this.platform.is('capacitor')) return;

    try {
      const appInfo = await App.getInfo();
      const currentVersion = appInfo.version;
      const platform = this.platform.is('ios') ? 'ios' : 'android';

      console.log(`[VersionCheck] Iniciando verificação: v${currentVersion} em ${platform}`);

      // 1. Envia versão atual e plataforma para o backend conforme Workflow
      const serverInfo = await lastValueFrom(
        this.api.get('users/app-version', { version: currentVersion, platform })
      );
      
      console.log('[VersionCheck] Resposta do servidor:', serverInfo);

      // 2. Extrai os sinalizadores e URLs da resposta
      const { force_update, recommend_update, message, url_android, url_ios } = serverInfo.data;

      // 3. Decide a ação baseada nos status da resposta
      if (force_update || recommend_update) {
        const buttons = [];

        // Se for apenas recomendada, adicionamos o botão "Depois"
        if (!force_update) {
          buttons.push({ text: 'Depois', role: 'cancel' });
        }

        buttons.push({
          text: 'Atualizar Agora',
          handler: () => {
            const storeUrl = platform === 'ios' ? url_ios : url_android;
            window.open(storeUrl, '_system');
            return force_update ? false : true; // Bloqueia o fechamento se for obrigatório
          }
        });

        this.global.showAlert(
          message || 'Uma nova versão do app está disponível!',
          force_update ? 'Atualização Obrigatória' : 'Nova Versão Disponível',
          buttons,
          !force_update // backdropDismiss: false se for obrigatório
        );
      }
    } catch (e) {
      console.error('[AuthService] Erro ao verificar versão:', e);
    }
  }

  private compareVersions(v1: string, v2: string): number {
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (a[i] > b[i]) return 1;
      if (a[i] < b[i]) return -1;
    }
    return 0;
  }

  private getRedirectUrl(role?: string): UrlTree {
    let url: string | null = null;

    if (role === Strings.USER_TYPE) url = Strings.TABS;
    else if (role === Strings.ADMIN_TYPE || role === 'staff') url = Strings.ADMIN;
    else if (role === Strings.SUPER_TYPE || role === 'super_staff') url = Strings.SUPER_DASHBOARD;

    return url ? this.router.parseUrl(url) : this.router.parseUrl(Strings.LOGIN);
  }

  redirect(role?: string) {
    const urlTree = this.getRedirectUrl(role);
    if (urlTree.toString() === Strings.LOGIN) {
      console.warn("Cargo não reconhecido:", role);
      this.logout();
    } else {
      this.router.navigateByUrl(urlTree, { replaceUrl: true });
    }
  }
}
