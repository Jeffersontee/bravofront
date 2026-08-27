import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuToggle, IonButton, IonIcon, IonFooter } from '@ionic/angular/standalone';
import { ThemeService, AppTheme, AppearanceData } from '../../../services/theme/theme.service';
import { addIcons } from 'ionicons';
import { menuOutline, cloudUploadOutline, trashOutline, checkmarkOutline, imageOutline, addOutline } from 'ionicons/icons';
import { GlobalService } from 'src/app/services/global/global.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.page.html',
  styleUrls: ['./appearance.page.scss'],
  standalone: true,
  imports: [IonFooter, IonIcon, IonButton, IonButtons, IonMenuToggle, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AppearancePage implements OnInit {
  private themeService = inject(ThemeService);
  private global = inject(GlobalService);
  private profileService = inject(ProfileService);

  // Predefined color palette based on Adega Pinguins screenshot
  presetColors = [
    '#ffc409', // Yellow
    '#e11d48', // Red
    '#16a34a', // Green
    '#9333ea', // Purple
    '#1d4ed8', // Bravo Blue
    '#0f172a', // Slate
  ];

  // Component State
  currentTheme = signal<AppTheme>('light');
  primaryColor = signal<string>('#1d4ed8');
  logoUrl = signal<string>('');
  backgroundUrl = signal<string>('');
  
  tenantType = signal<'GLOBAL' | 'COMPANY'>('GLOBAL');
  companyId = signal<string | undefined>(undefined);
  
  isLoading = signal<boolean>(false);

  constructor() {
    addIcons({ menuOutline, cloudUploadOutline, trashOutline, checkmarkOutline, imageOutline, addOutline });
  }

  async ngOnInit() {
    this.global.showLoader('Carregando Aparência...');
    
    // Identificar contexto (Global vs Company) baseando-se no perfil logado.
    // O Super Admin configura o GLOBAL. O Company Owner configura o COMPANY.
    try {
      const user = await this.profileService.getProfile();
      if (user && user.type === 'company_owner' && user.company_id) {
        this.tenantType.set('COMPANY');
        this.companyId.set(user.company_id);
      } else {
        this.tenantType.set('GLOBAL');
      }

      // Fetch do banco de dados
      const appearance = await this.themeService.loadAppearance(this.tenantType(), this.companyId());
      if (appearance) {
        this.currentTheme.set(appearance.theme);
        this.primaryColor.set(appearance.primary_color || '#1d4ed8');
        this.logoUrl.set(appearance.logo_url || '');
        this.backgroundUrl.set(appearance.background_url || '');
      }
    } catch (e) {
      console.error(e);
      this.global.errorToast('Não foi possível carregar as configurações de aparência.');
    } finally {
      this.global.hideLoader();
    }
  }

  // File Upload Helper (converts to Base64 to save on DB easily)
  onFileSelected(event: any, type: 'logo' | 'background') {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.global.errorToast('A imagem não pode ter mais de 2MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        if (type === 'logo') {
          this.logoUrl.set(base64String);
        } else {
          this.backgroundUrl.set(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(type: 'logo' | 'background') {
    if (type === 'logo') this.logoUrl.set('');
    if (type === 'background') this.backgroundUrl.set('');
  }

  // Theme Toggles
  setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
    this.themeService.setTheme(theme); // Live preview
  }

  // Color Pickers
  setColor(colorHex: string) {
    this.primaryColor.set(colorHex);
    this.themeService.setPrimaryColor(colorHex); // Live preview
  }
  
  onCustomColorChange(event: any) {
    const color = event.target.value;
    this.setColor(color);
  }

  isCustomColor(): boolean {
    return !this.presetColors.includes(this.primaryColor().toLowerCase());
  }

  // Save to Backend
  async saveAppearance() {
    this.isLoading.set(true);
    try {
      const payload: Partial<AppearanceData> = {
        tenant_type: this.tenantType(),
        company_id: this.companyId(),
        theme: this.currentTheme(),
        primary_color: this.primaryColor(),
        logo_url: this.logoUrl(),
        background_url: this.backgroundUrl()
      };

      const success = await this.themeService.updateAppearance(payload);
      
      if (success) {
        this.global.successToast('Identidade Visual atualizada com sucesso!');
      } else {
        throw new Error('Falha ao salvar aparência');
      }
    } catch (e) {
      console.error(e);
      this.global.errorToast('Ocorreu um erro ao salvar as alterações.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
