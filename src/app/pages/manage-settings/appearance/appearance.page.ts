import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuToggle, IonButton, IonIcon, IonFooter } from '@ionic/angular/standalone';
import { ThemeService, AppTheme, AppearanceData } from '../../../services/theme/theme.service';
import { addIcons } from 'ionicons';
import { 
  menuOutline, cloudUploadOutline, trashOutline, 
  checkmarkOutline, imageOutline, addOutline,
  mailOutline, lockClosedOutline, eyeOutline,
  gridOutline, speedometerOutline, constructOutline,
  calendarOutline, businessOutline, buildOutline,
  peopleOutline, settingsOutline, logOutOutline
} from 'ionicons/icons';
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
  
  previewTab = signal<'login' | 'dashboard'>('dashboard');
  
  tenantType = signal<'GLOBAL' | 'COMPANY'>('GLOBAL');
  companyId = signal<string | undefined>(undefined);
  
  isLoading = signal<boolean>(false);

  constructor() {
    addIcons({ 
      menuOutline, cloudUploadOutline, trashOutline, 
      checkmarkOutline, imageOutline, addOutline,
      mailOutline, lockClosedOutline, eyeOutline,
      gridOutline, speedometerOutline, constructOutline,
      calendarOutline, businessOutline, buildOutline,
      peopleOutline, settingsOutline, logOutOutline
    });
  }

  async ngOnInit() {
    this.global.showLoader('Carregando Aparência...');
    
    try {
      const user = await this.profileService.getProfile();
      if (user && user.type === 'company_owner' && user.company_id) {
        this.tenantType.set('COMPANY');
        const rawCompId = user.company_id as any;
        const compId = typeof rawCompId === 'object' ? rawCompId._id : rawCompId;
        this.companyId.set(compId);
        this.previewTab.set('dashboard'); // Lojista só visualiza o Menu & Painel
      } else {
        this.tenantType.set('GLOBAL');
        this.previewTab.set('login'); // Super Admin visualiza Tela de Login inicialmente
      }

      const appearance = await this.themeService.loadAppearance(this.tenantType(), this.companyId());
      if (appearance) {
        this.currentTheme.set(appearance.theme || 'light');
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

  onFileSelected(event: any, type: 'logo' | 'background') {
    const file = event.target.files[0];
    if (file) {
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

  setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
    this.themeService.setTheme(theme);
  }

  setColor(colorHex: string) {
    this.primaryColor.set(colorHex);
    this.themeService.setPrimaryColor(colorHex);
  }
  
  onCustomColorChange(event: any) {
    const color = event.target.value;
    this.setColor(color);
  }

  isCustomColor(): boolean {
    return !this.presetColors.includes(this.primaryColor().toLowerCase());
  }

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
    } catch (e: any) {
      console.error(e);
      const msg = e?.error?.message || e?.message || 'Ocorreu um erro ao salvar as alterações.';
      this.global.errorToast(msg);
    } finally {
      this.isLoading.set(false);
    }
  }
}
