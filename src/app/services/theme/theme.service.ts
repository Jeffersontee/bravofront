import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

export type AppTheme = 'light' | 'dark';

export interface AppearanceData {
  tenant_type: 'GLOBAL' | 'COMPANY';
  company_id?: string;
  theme: AppTheme;
  primary_color: string;
  logo_url: string;
  background_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private http = inject(HttpClient);
  
  currentTheme = signal<AppTheme>('light');
  currentAppearance = signal<AppearanceData | null>(null);

  constructor() {
    this.initThemeFallback();
  }

  initThemeFallback() {
    const savedTheme = localStorage.getItem('app-theme') as AppTheme;
    if (savedTheme === 'dark') {
      document.body.classList.add('theme-dark');
      this.currentTheme.set('dark');
    } else {
      document.body.classList.remove('theme-dark');
      this.currentTheme.set('light');
    }
    
    const savedColor = localStorage.getItem('app-primary-color');
    if (savedColor) {
      this.setPrimaryColor(savedColor);
    }
  }

  async loadAppearance(tenantType: 'GLOBAL' | 'COMPANY', companyId?: string) {
    try {
      let url = `${environment.serverUrl}/appearance?tenant_type=${tenantType}`;
      if (tenantType === 'COMPANY' && companyId) {
        url += `&company_id=${companyId}`;
      }

      const res = await firstValueFrom(this.http.get<{success: boolean, data: AppearanceData}>(url));
      
      if (res && res.success && res.data) {
        const appearance = res.data;
        this.currentAppearance.set(appearance);
        
        this.setTheme(appearance.theme);
        
        if (appearance.primary_color) {
          this.setPrimaryColor(appearance.primary_color);
        }
        
        return appearance;
      }
    } catch (e) {
      console.error('Failed to load appearance', e);
    }
    return null;
  }

  setTheme(theme: AppTheme) {
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
    this.currentTheme.set(theme);
    localStorage.setItem('app-theme', theme);
  }
  
  setPrimaryColor(colorHex: string) {
    document.documentElement.style.setProperty('--ion-color-primary', colorHex);
    
    // Calcula o RGB para a variável secundária (usada em opacidades)
    let hex = colorHex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      document.documentElement.style.setProperty('--ion-color-primary-rgb', `${r}, ${g}, ${b}`);
    }
    
    localStorage.setItem('app-primary-color', colorHex);
  }

  async updateAppearance(data: Partial<AppearanceData>) {
    try {
      const url = `${environment.serverUrl}/appearance`;
      const res = await firstValueFrom(this.http.post<{success: boolean, data: AppearanceData}>(url, data));
      if (res && res.success && res.data) {
        this.currentAppearance.set(res.data);
        this.setTheme(res.data.theme);
        if (res.data.primary_color) {
          this.setPrimaryColor(res.data.primary_color);
        }
        return res.data;
      }
    } catch (e) {
      console.error('Error updating appearance', e);
      throw e;
    }
    return null;
  }
}
