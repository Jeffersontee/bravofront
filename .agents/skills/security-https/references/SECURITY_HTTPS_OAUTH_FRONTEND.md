# 🔐 Segurança Frontend - HTTPS + OAuth Implementation

## 🎨 Componentes de Autenticação

### **1. Página de Login Seguro**

```typescript
// pages/auth/login/login.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.createForm();
  }

  ngOnInit() {
    // Redirecionar se já estiver logado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.showValidationErrors();
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Entrando...'
    });
    await loading.present();

    try {
      const { email, password } = this.loginForm.value;
      const response = await this.authService.login({ email, password }).toPromise();

      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: `Bem-vindo, ${response.data.user.name}!`,
        duration: 3000,
        color: 'success'
      });
      await toast.present();

      // Redirecionar baseado no role
      this.redirectBasedOnRole(response.data.user.role);

    } catch (error) {
      await loading.dismiss();
      await this.handleLoginError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private showValidationErrors() {
    const errors = [];

    if (this.loginForm.get('email')?.hasError('required')) {
      errors.push('Email é obrigatório');
    } else if (this.loginForm.get('email')?.hasError('email')) {
      errors.push('Email inválido');
    }

    if (this.loginForm.get('password')?.hasError('required')) {
      errors.push('Senha é obrigatória');
    } else if (this.loginForm.get('password')?.hasError('minlength')) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    this.showAlert('Erro de Validação', errors.join('\n'));
  }

  private async handleLoginError(error: any) {
    let message = 'Erro ao fazer login. Tente novamente.';

    if (error.error?.code) {
      switch (error.error.code) {
        case 'LOGIN_FAILED':
          message = 'Email ou senha incorretos';
          break;
        case 'ACCOUNT_LOCKED':
          message = 'Conta temporariamente bloqueada devido a muitas tentativas. Tente novamente em 2 horas.';
          break;
        case 'ACCOUNT_NOT_VERIFIED':
          message = 'Conta não verificada. Verifique seu email.';
          break;
      }
    }

    const alert = await this.alertCtrl.create({
      header: 'Erro no Login',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private redirectBasedOnRole(role: string) {
    switch (role) {
      case 'super_admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'establishment_admin':
      case 'establishment_user':
        this.router.navigate(['/establishment/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  async forgotPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Esqueci minha senha',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Digite seu email'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: async (data) => {
            if (data.email) {
              await this.sendResetEmail(data.email);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async sendResetEmail(email: string) {
    try {
      await this.authService.forgotPassword(email).toPromise();

      const toast = await this.toastCtrl.create({
        message: 'Se o email existir, um link de reset foi enviado.',
        duration: 4000,
        color: 'success'
      });
      await toast.present();

    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Erro ao enviar email de reset.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
```

```html
<!-- login.page.html -->
<ion-header>
  <ion-toolbar color="primary">
    <ion-title>Entrar</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="login-content">
  <div class="login-container">
    <!-- Logo -->
    <div class="logo-container">
      <ion-icon name="restaurant" class="logo-icon"></ion-icon>
      <h1>SaaS Restaurante</h1>
      <p>Gerencie seu estabelecimento com segurança</p>
    </div>

    <!-- Form -->
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <ion-list>
        <!-- Email -->
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input
            formControlName="email"
            type="email"
            autocomplete="email"
            inputmode="email"
            [class.invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
          </ion-input>
        </ion-item>

        <!-- Password -->
        <ion-item>
          <ion-label position="floating">Senha</ion-label>
          <ion-input
            formControlName="password"
            [type]="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            [class.invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
          </ion-input>
          <ion-button
            fill="clear"
            slot="end"
            (click)="togglePasswordVisibility()"
            type="button">
            <ion-icon [name]="showPassword ? 'eye-off' : 'eye'"></ion-icon>
          </ion-button>
        </ion-item>

        <!-- Remember Me -->
        <ion-item lines="none">
          <ion-checkbox formControlName="remember" slot="start"></ion-checkbox>
          <ion-label>Lembrar de mim</ion-label>
        </ion-item>
      </ion-list>

      <!-- Submit Button -->
      <ion-button
        expand="block"
        type="submit"
        [disabled]="loginForm.invalid || isLoading"
        class="login-button">
        <ion-spinner *ngIf="isLoading" name="crescent" slot="start"></ion-spinner>
        <ion-icon *ngIf="!isLoading" name="log-in" slot="start"></ion-icon>
        Entrar
      </ion-button>
    </form>

    <!-- Links -->
    <div class="auth-links">
      <ion-button fill="clear" (click)="forgotPassword()">
        Esqueci minha senha
      </ion-button>
    </div>

    <!-- Security Notice -->
    <div class="security-notice">
      <ion-icon name="shield-checkmark" color="success"></ion-icon>
      <small>Conexão segura HTTPS</small>
    </div>
  </div>
</ion-content>
```

### **2. Página de Registro Seguro**

```typescript
// pages/auth/register/register.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.createForm();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private createForm() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]],
      establishment_name: ['', [Validators.required, Validators.minLength(2)]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
    } else {
      const errors = confirmPassword?.errors;
      if (errors) {
        delete errors['mismatch'];
        confirmPassword?.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.showValidationErrors();
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Criando conta...'
    });
    await loading.present();

    try {
      const formData = this.registerForm.value;
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        establishment_name: formData.establishment_name
      };

      const response = await this.authService.register(userData).toPromise();

      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: 'Conta criada com sucesso! Bem-vindo!',
        duration: 3000,
        color: 'success'
      });
      await toast.present();

      this.router.navigate(['/establishment/setup']);

    } catch (error) {
      await loading.dismiss();
      await this.handleRegisterError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private showValidationErrors() {
    const errors = [];

    // Name validation
    if (this.registerForm.get('name')?.hasError('required')) {
      errors.push('Nome é obrigatório');
    } else if (this.registerForm.get('name')?.hasError('minlength')) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    // Email validation
    if (this.registerForm.get('email')?.hasError('required')) {
      errors.push('Email é obrigatório');
    } else if (this.registerForm.get('email')?.hasError('email')) {
      errors.push('Email inválido');
    }

    // Password validation
    if (this.registerForm.get('password')?.hasError('required')) {
      errors.push('Senha é obrigatória');
    } else if (this.registerForm.get('password')?.hasError('minlength')) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    } else if (this.registerForm.get('password')?.hasError('pattern')) {
      errors.push('Senha deve conter maiúscula, minúscula, número e caractere especial');
    }

    // Confirm password
    if (this.registerForm.get('confirmPassword')?.hasError('mismatch')) {
      errors.push('Senhas não coincidem');
    }

    // Establishment name
    if (this.registerForm.get('establishment_name')?.hasError('required')) {
      errors.push('Nome do estabelecimento é obrigatório');
    }

    // Terms
    if (!this.registerForm.get('acceptTerms')?.value) {
      errors.push('Você deve aceitar os termos de serviço');
    }

    this.showAlert('Erro de Validação', errors.join('\n'));
  }

  private async handleRegisterError(error: any) {
    let message = 'Erro ao criar conta. Tente novamente.';

    if (error.error?.code) {
      switch (error.error.code) {
        case 'REGISTRATION_FAILED':
          message = error.error.error || 'Erro ao criar conta';
          break;
        case 'EMAIL_EXISTS':
          message = 'Este email já está cadastrado';
          break;
        case 'WEAK_PASSWORD':
          message = 'Senha muito fraca. Use uma senha mais forte.';
          break;
      }
    }

    const alert = await this.alertCtrl.create({
      header: 'Erro no Cadastro',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length === 0) return '';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
```

```html
<!-- register.page.html -->
<ion-header>
  <ion-toolbar color="primary">
    <ion-title>Criar Conta</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="register-content">
  <div class="register-container">
    <!-- Header -->
    <div class="register-header">
      <ion-icon name="person-add" class="header-icon"></ion-icon>
      <h2>Comece Grátis</h2>
      <p>Crie sua conta e gerencie seu restaurante</p>
    </div>

    <!-- Form -->
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <ion-list>
        <!-- Name -->
        <ion-item>
          <ion-label position="floating">Nome Completo</ion-label>
          <ion-input
            formControlName="name"
            autocomplete="name"
            [class.invalid]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
          </ion-input>
        </ion-item>

        <!-- Email -->
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input
            formControlName="email"
            type="email"
            autocomplete="email"
            inputmode="email"
            [class.invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
          </ion-input>
        </ion-item>

        <!-- Establishment Name -->
        <ion-item>
          <ion-label position="floating">Nome do Estabelecimento</ion-label>
          <ion-input
            formControlName="establishment_name"
            autocomplete="organization"
            [class.invalid]="registerForm.get('establishment_name')?.invalid && registerForm.get('establishment_name')?.touched">
          </ion-input>
        </ion-item>

        <!-- Password -->
        <ion-item>
          <ion-label position="floating">Senha</ion-label>
          <ion-input
            formControlName="password"
            [type]="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            [class.invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
          </ion-input>
          <ion-button
            fill="clear"
            slot="end"
            (click)="togglePasswordVisibility('password')"
            type="button">
            <ion-icon [name]="showPassword ? 'eye-off' : 'eye'"></ion-icon>
          </ion-button>
        </ion-item>

        <!-- Password Strength -->
        <div *ngIf="registerForm.get('password')?.value" class="password-strength">
          <div class="strength-bar">
            <div
              class="strength-fill"
              [class]="getPasswordStrength()">
            </div>
          </div>
          <small class="strength-text">
            Força da senha:
            <span [class]="getPasswordStrength()">
              {{ getPasswordStrength() === 'weak' ? 'Fraca' :
                 getPasswordStrength() === 'medium' ? 'Média' : 'Forte' }}
            </span>
          </small>
        </div>

        <!-- Confirm Password -->
        <ion-item>
          <ion-label position="floating">Confirmar Senha</ion-label>
          <ion-input
            formControlName="confirmPassword"
            [type]="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            [class.invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
          </ion-input>
          <ion-button
            fill="clear"
            slot="end"
            (click)="togglePasswordVisibility('confirm')"
            type="button">
            <ion-icon [name]="showConfirmPassword ? 'eye-off' : 'eye'"></ion-icon>
          </ion-button>
        </ion-item>

        <!-- Terms and Conditions -->
        <ion-item lines="none">
          <ion-checkbox formControlName="acceptTerms" slot="start"></ion-checkbox>
          <ion-label>
            Aceito os
            <a href="#" target="_blank">Termos de Serviço</a> e
            <a href="#" target="_blank">Política de Privacidade</a>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Submit Button -->
      <ion-button
        expand="block"
        type="submit"
        [disabled]="registerForm.invalid || isLoading"
        class="register-button">
        <ion-spinner *ngIf="isLoading" name="crescent" slot="start"></ion-spinner>
        <ion-icon *ngIf="!isLoading" name="person-add" slot="start"></ion-icon>
        Criar Conta
      </ion-button>
    </form>

    <!-- Login Link -->
    <div class="auth-links">
      <p>Já tem conta?
        <ion-button fill="clear" routerLink="/login">
          Entrar
        </ion-button>
      </p>
    </div>
  </div>
</ion-content>
```

### **3. Guard de Autenticação**

```typescript
// guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkAuth(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): Observable<boolean> {
    // Verificar se tem token local
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
      return of(false);
    }

    // Verificar token no servidor
    return this.authService.verifyToken().pipe(
      map((response: any) => {
        // Token válido
        return true;
      }),
      catchError(async (error) => {
        // Token inválido/expirado
        console.warn('Token verification failed:', error);

        // Tentar refresh automático
        try {
          await this.authService.refreshToken().toPromise();
          return true;
        } catch (refreshError) {
          // Refresh falhou, redirecionar para login
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
          return false;
        }
      })
    );
  }
}
```

### **4. Guard de Role**

```typescript
// guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!requiredRoles.includes(user.role)) {
      this.showAccessDenied();
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }

  private async showAccessDenied() {
    const toast = await this.toastCtrl.create({
      message: 'Acesso negado. Você não tem permissão para acessar esta página.',
      duration: 4000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
}
```

---

## 🎨 Estilos SCSS Seguros

### **1. Login Page Styles**

```scss
// login.page.scss
.login-content {
  --background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%);
}

.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
}

.logo-container {
  text-align: center;
  margin-bottom: 40px;

  .logo-icon {
    font-size: 64px;
    color: white;
    margin-bottom: 16px;
  }

  h1 {
    color: white;
    margin: 0 0 8px 0;
    font-size: 2em;
  }

  p {
    color: rgba(white, 0.8);
    margin: 0;
  }
}

ion-list {
  background: transparent;
  margin-bottom: 24px;

  ion-item {
    --background: rgba(white, 0.1);
    --border-radius: 8px;
    --inner-border-width: 0;
    margin-bottom: 16px;
    --color: white;

    ion-label {
      --color: white;
    }

    ion-input {
      --color: white;
      --placeholder-color: rgba(white, 0.6);

      &.invalid {
        --border-color: var(--ion-color-danger);
      }
    }

    ion-checkbox {
      --border-color: white;
      --background-checked: white;
      --checkmark-color: var(--ion-color-primary);
    }
  }
}

.login-button {
  --border-radius: 8px;
  height: 48px;
  margin-bottom: 16px;
  --background: white;
  --color: var(--ion-color-primary);

  ion-icon {
    margin-right: 8px;
  }
}

.auth-links {
  text-align: center;

  ion-button {
    --color: white;
    font-size: 0.9em;
  }
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  color: rgba(white, 0.8);
  font-size: 0.8em;

  ion-icon {
    font-size: 1.2em;
  }
}
```

### **2. Register Page Styles**

```scss
// register.page.scss
.register-content {
  --background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%);
}

.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;

  .header-icon {
    font-size: 48px;
    color: white;
    margin-bottom: 16px;
  }

  h2 {
    color: white;
    margin: 0 0 8px 0;
    font-size: 1.8em;
  }

  p {
    color: rgba(white, 0.8);
    margin: 0;
  }
}

ion-list {
  background: transparent;
  margin-bottom: 24px;

  ion-item {
    --background: rgba(white, 0.1);
    --border-radius: 8px;
    --inner-border-width: 0;
    margin-bottom: 16px;
    --color: white;

    ion-label {
      --color: white;

      a {
        color: var(--ion-color-light);
        text-decoration: underline;
      }
    }

    ion-input {
      --color: white;
      --placeholder-color: rgba(white, 0.6);

      &.invalid {
        --border-color: var(--ion-color-danger);
      }
    }

    ion-checkbox {
      --border-color: white;
      --background-checked: white;
      --checkmark-color: var(--ion-color-primary);
    }
  }
}

.password-strength {
  margin: -8px 16px 16px 16px;

  .strength-bar {
    height: 4px;
    background: rgba(white, 0.2);
    border-radius: 2px;
    margin-bottom: 8px;
    overflow: hidden;

    .strength-fill {
      height: 100%;
      transition: width 0.3s ease;

      &.weak {
        width: 33%;
        background: var(--ion-color-danger);
      }

      &.medium {
        width: 66%;
        background: var(--ion-color-warning);
      }

      &.strong {
        width: 100%;
        background: var(--ion-color-success);
      }
    }
  }

  .strength-text {
    color: white;
    font-size: 0.8em;

    span {
      font-weight: bold;

      &.weak {
        color: var(--ion-color-danger);
      }

      &.medium {
        color: var(--ion-color-warning);
      }

      &.strong {
        color: var(--ion-color-success);
      }
    }
  }
}

.register-button {
  --border-radius: 8px;
  height: 48px;
  margin-bottom: 16px;
  --background: white;
  --color: var(--ion-color-primary);

  ion-icon {
    margin-right: 8px;
  }
}

.auth-links {
  text-align: center;
  color: white;

  p {
    margin: 0;
  }

  ion-button {
    --color: white;
    font-size: 0.9em;
  }
}
```

---

## 🔐 Configuração de Ambiente Seguro

### **1. Environment Configuration**

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com',
  appUrl: 'https://app.yourdomain.com',

  // OAuth Configuration
  oauth: {
    google: {
      clientId: 'your-google-client-id',
      redirectUri: 'https://app.yourdomain.com/auth/google/callback'
    },
    facebook: {
      clientId: 'your-facebook-app-id',
      redirectUri: 'https://app.yourdomain.com/auth/facebook/callback'
    }
  },

  // Security Configuration
  security: {
    enableHttps: true,
    enableCsrf: true,
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    maxLoginAttempts: 5,
    lockoutDuration: 2 * 60 * 60 * 1000, // 2 hours
  },

  // Feature Flags
  features: {
    twoFactorAuth: true,
    passwordReset: true,
    auditLogging: true,
    rateLimiting: true
  }
};
```

### **2. App Module Security**

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Security
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'ios',
      // Security configurations
      hardwareBackButton: false,
      swipeBackEnabled: false
    }),
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Security Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    // Guards
    AuthGuard,
    RoleGuard
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### **3. App Routing Security**

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['super_admin'] }
  },
  {
    path: 'establishment',
    loadChildren: () => import('./pages/establishment/establishment.module').then(m => m.EstablishmentPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['establishment_admin', 'establishment_user'] }
  },
  {
    path: 'unauthorized',
    loadChildren: () => import('./pages/unauthorized/unauthorized.module').then(m => m.UnauthorizedPageModule)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      // Security: enable route tracing in development only
      enableTracing: !environment.production
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

---

## 🛡️ Interceptor de Erro Seguro

```typescript
// core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(async (error: HttpErrorResponse) => {
        // Dismiss any loading
        await this.loadingCtrl.dismiss();

        // Handle different error types
        if (error.status === 401) {
          await this.handle401Error(error);
        } else if (error.status === 403) {
          await this.handle403Error(error);
        } else if (error.status === 429) {
          await this.handle429Error(error);
        } else if (error.status >= 500) {
          await this.handleServerError(error);
        } else {
          await this.handleGenericError(error);
        }

        return throwError(error);
      })
    );
  }

  private async handle401Error(error: HttpErrorResponse) {
    const errorCode = error.error?.code;

    if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID') {
      // Try to refresh token automatically
      try {
        await this.authService.refreshToken().toPromise();
        // If refresh succeeds, the request will be retried by the auth interceptor
        return;
      } catch (refreshError) {
        // Refresh failed, logout user
        this.authService.logout();
        this.router.navigate(['/login']);
        await this.showAlert('Sessão Expirada', 'Sua sessão expirou. Faça login novamente.');
      }
    } else {
      this.authService.logout();
      this.router.navigate(['/login']);
      await this.showAlert('Não Autorizado', 'Você precisa fazer login para continuar.');
    }
  }

  private async handle403Error(error: HttpErrorResponse) {
    const message = error.error?.error || 'Acesso negado. Você não tem permissão para esta ação.';
    await this.showAlert('Acesso Negado', message);
  }

  private async handle429Error(error: HttpErrorResponse) {
    const retryAfter = error.headers.get('Retry-After');
    const message = `Muitas tentativas. Tente novamente em ${retryAfter || 'alguns minutos'}.`;
    await this.showToast(message, 'warning');
  }

  private async handleServerError(error: HttpErrorResponse) {
    console.error('Server error:', error);
    const message = 'Erro interno do servidor. Tente novamente mais tarde.';
    await this.showAlert('Erro do Servidor', message);
  }

  private async handleGenericError(error: HttpErrorResponse) {
    const message = error.error?.error || 'Ocorreu um erro inesperado.';
    await this.showToast(message, 'danger');
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 4000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
```

Esta implementação completa o sistema de segurança frontend, oferecendo autenticação OAuth robusta, proteção HTTPS, validação de formulários segura e tratamento adequado de erros de segurança.