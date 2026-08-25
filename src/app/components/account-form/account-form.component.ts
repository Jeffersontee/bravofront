import { Component, Input, OnInit, signal, inject, effect, computed, WritableSignal } from '@angular/core';

import { FormsModule, NgForm } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, 
  IonItem, IonInput, IonIcon, IonButton, IonSpinner, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonIcon,
    IonButton,
    IonSpinner,
    IonNote
]
})
export class AccountFormComponent implements OnInit {
  /** Perfil do usuário recebido para edição */
  userProfile = signal<User | null>(null);
  
  // Sinais locais para os campos do formulário
  emailValue = signal('');
  phoneValue = signal('');

  @Input() set profile(value: User | null) {
    this.userProfile.set(value);
    // Inicializa o documentValue se o CPF/CNPJ existir no perfil
    if (value?.cpf) {
      this.documentValue.set(value.cpf);
    }
    if (value?.email) this.emailValue.set(value.email);
    if (value?.phone) this.phoneValue.set(value.phone);
    this.passwordValue.set('');
  }
  
  isSubmitted = signal(false);

  // SINAIS PARA VALIDAÇÃO DE DOCUMENTO (CPF/CNPJ)
  documentValue = signal('');
  
  passwordValue = signal(''); // Sinal para o campo de senha
  // Computed signal que valida o documento em tempo real
  isDocumentValid = computed(() => {
    const val = this.documentValue().replace(/\D/g, '');
    if (val.length === 0) return true; // Opcional: válido se vazio
    return this.validateCPF(val) || this.validateCNPJ(val);
  });

  // Computed para mensagem de erro amigável
  documentErrorMessage = computed(() => {
    const val = this.documentValue().replace(/\D/g, '');
    if (val.length > 0 && !this.isDocumentValid()) {
      return 'CPF ou CNPJ inválido';
    }
    return '';
  });

  // Computed para verificar se o e-mail mudou (habilita campo de senha)
  isEmailChanged = computed(() => {
    const profile = this.userProfile();
    const current = (profile?.email || '').toLowerCase().trim();
    const input = (this.emailValue() || '').toLowerCase().trim();
    return current !== input;
  });

  // Computed para verificar se houve QUALQUER mudança (habilita botão salvar)
  hasChanges = computed(() => {
    const profile = this.userProfile();
    if (!profile) return false;
    const emailMod = this.emailValue().toLowerCase().trim() !== (profile.email || '').toLowerCase().trim();
    const phoneMod = this.phoneValue().replace(/\D/g, '') !== (profile.phone || '').replace(/\D/g, '');
    const cpfMod = this.documentValue().replace(/\D/g, '') !== (profile?.cpf || '').replace(/\D/g, '');
    return emailMod || phoneMod || cpfMod;
  });

  private profileService = inject(ProfileService); // Injeção de dependência moderna
  private global = inject(GlobalService);

  constructor() {
    addIcons({ checkmarkOutline });

    // Implementação do effect para monitorar mudanças no input reativamente
    effect(() => {
      const userData = this.userProfile(); // Observa o signal userProfile
      if (userData) {
        console.log('✅ [AccountForm] Perfil carregado:', userData.email);
      }
    });
  }

  // Lógica de validação básica (pode ser expandida com algoritmos de dígito verificador)
  private validateCPF(cpf: string): boolean {
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    return true; // Simplificado para exemplo, adicione o cálculo de dígitos se necessário
  }

  private validateCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;
    return true;
  }

  ngOnInit() {}

  /** Envia os dados atualizados para o serviço de perfil */
  async onSubmit(form: NgForm) {
    if (!form.valid || !this.isDocumentValid()) return;

    if (!this.hasChanges()) {
      console.log('ℹ️ Nenhuma alteração detectada.');
      this.global.modalDismiss(null); // Fecha o modal sem disparar o fluxo de sucesso
      return;
    }

    try {
      this.isSubmitted.set(true);

      // O servidor exige o e-mail em todas as requisições de atualização (Erro 422: Email is required)
      const payload: any = {
        email: this.emailValue().toLowerCase().trim(),
        phone: (this.phoneValue() || '').replace(/\D/g, ''),
        cpf: (this.documentValue() || '').replace(/\D/g, '') || null // Envia null se estiver vazio
      };

      // A senha só é enviada se houver mudança real no e-mail para validar a troca de identidade
      if (this.isEmailChanged()) {
        payload.password = form.value.password;
      }

      const res = await this.profileService.updateProfile(payload);
      // Fecha o modal e envia o resultado (que pode conter email_changed: true/false)
      this.global.modalDismiss(res?.data || res);
    } catch (e: any) {
      // Se o erro for de e-mail duplicado, exibe a mensagem específica
      if (e?.error?.message?.includes('email already exist')) {
        this.global.errorToast('Este e-mail já está cadastrado por outro usuário.');
      } else {
        this.global.checkMessageForErrorToast(e);
      }
      
    } finally {
      this.isSubmitted.set(false);
    }
  }
}
