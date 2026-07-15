import { Injectable, signal } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { ApiService } from '../api/api.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  private _profile = signal<User | null>(null);

  // Exposição direta do signal como propriedade (mais idiomático)
  profile = this._profile.asReadonly();

  constructor(
    private api: ApiService
  ) { }

  /**
   * Obtém o perfil do usuário.
   * @param forceRefresh Se verdadeiro, ignora o cache e busca dados frescos da API.
   */
  async getProfile(forceRefresh: boolean = false) {
    try {
      const profile_data = this._profile();
      // Retorna cache apenas se não for solicitado um refresh forçado
      if(profile_data && !forceRefresh) {
        return profile_data;
      }
      
      // Se não houver cache, faz requisição HTTP
      const res: any = await lastValueFrom(this.api.get('users/profile'));
      console.log('profile raw res: ', res);
      return this.updateProfileData(res);
    } catch(e) {
        console.log('Erro ao obter perfil:', e);
      throw(e);
    }
  }

  async updatePhoneNumber(phone: string) {
    try {
      const res: any = await lastValueFrom(this.api.patch('users/update/phone', { phone }));
      console.log('phone update res: ', res);
      const updated = this.updateProfileData(res);
      return updated;
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }

  async updateProfile(param: any) {
    try {
      const res: any = await lastValueFrom(this.api.patch('users/update/profile', {...param}));
      console.log('profile update res: ', res);
      const data = res?.data || res;
      this.updateProfileData(data);
      return data; // Retorna o conteúdo de 'data' (contendo tokens e user)
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }

  async updateProfilePic(formData: FormData) {
    try {
      const res: any = await lastValueFrom(this.api.put('users/update/profilePic', formData, true));
      console.log('profile pic update res: ', res);
      this.updateProfileData(res);
      return res;
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }

  async resendOtp() {
    try {
      return await lastValueFrom(this.api.get('users/send/verification/email'));
    } catch(e) {
      throw(e);
    }
  }

  async verifyEmailOtp(data: any) {
    try {
      const response = await lastValueFrom(this.api.patch('users/verify/emailToken', data));
      const currentProfile = this._profile();
      if (currentProfile) {
        // Usamos User.fromJson para garantir que o objeto literal resultante do spread seja convertido em uma instância válida de User
        this.updateProfileData(User.fromJson({ ...currentProfile, email_verified: true }));
      }
      return response;
    } catch(e) {
      throw(e);
    }
  }

  /**
   * Normaliza e atualiza o Signal com os dados do usuário.
   * Lida com a estrutura aninhada 'user' vinda do login/update.
   */
  updateProfileData(profile: any) {
    // Extrai o conteúdo do envelope de API (data) se ele existir
    const data = profile?.data || profile;
    // Resolve o objeto de usuário independente de onde ele esteja no JSON
    const userData = data?.user || data;

    if (userData && (userData._id || userData.email)) {
      // Aplica o método estático para mapeamento seguro e explícito
      const user = User.fromJson(userData);
      console.log('Perfil mapeado com sucesso:', user);
      this._profile.set(user);
      return user;
    }

    this._profile.set(null);
    return null;
  }
}
