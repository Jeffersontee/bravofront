# Padrão de Criação de Modals e Formulários (Ionic Angular + Signals Reativos)

Sempre crie formulários de edição e modais de captura de dados seguindo estritamente as diretrizes reativas e de UX estruturadas abaixo.

## Regras do Arquivo TypeScript (.ts)
1. **Inicialização por Setters `@Input`**: Dados recebidos do componente pai para edição devem ser interceptados via `@Input() set propriedade(...)` para alimentar os Signals locais e resetar estados secundários (ex: campos de senha).
2. **Campos Controlados por Signals Locais**: Todo input do formulário deve possuir um `signal('')` dedicado para controle bidirecional assíncrono.
3. **Regras de Negócio e Validações Computadas**:
   - Use `computed()` para validações complexas que dependem de strings higienizadas (ex: `.replace(/\D/g, '')`).
   - Use `computed()` com o nome `isEmailChanged` ou similar para detectar mudanças de dados sensíveis e abrir campos condicionais.
   - Use `computed()` com o nome `hasChanges` para validar se o botão de submit deve ser desbloqueado, evitando requisições desnecessárias ao servidor se os dados forem idênticos ao perfil original.
4. **Bloqueio de Submissão Dupla**: Monitore o estado do envio com um signal `isSubmitted = signal(false)` para desabilitar botões e alternar o layout do botão para um spinner.
5. **Fechamento via GlobalService**: O encerramento do modal e o retorno de dados para a página principal devem ser centralizados invocando `this.global.modalDismiss(dados)`.

## Regras do Template HTML (.html)
1. **Sintaxe de Bind de Sinais**: Mantenha a compatibilidade com formulários clássicos (`ngForm`) utilizando a combinação de leitura do sinal no model e escrita no evento de input: `[ngModel]="campoValue()"` e `(ionInput)="campoValue.set($event.detail.value)"`.
2. **Feedback Visual de Validação**: Adicione ícones condicionais (`<ion-icon name="checkmark-outline">`) baseados no estado `.valid` do template-driven form.
3. **Alternância Dinâmica de Botão/Spinner**:
   - Exiba o `<ion-button type="submit">` condicionado a `*ngIf="!isSubmitted()"`.
   - Exiba o `<ion-spinner name="crescent">` condicionado a `*ngIf="isSubmitted()"`.

## Exemplo de Referência Completo

### TypeScript (.ts)
```typescript
import { Component, Input, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule } from '@ionic/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-form-modal-exemplo',
  templateUrl: './form-modal-exemplo.component.html',
  styleUrls: ['./form-modal-exemplo.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class FormModalExemploComponent implements OnInit {
  private global = inject(GlobalService);
  
  entidadeOriginal = signal<any>(null);
  nomeValue = signal('');
  isSubmitted = signal(false);

  @Input() set dadosInput(value: any) {
    this.entidadeOriginal.set(value);
    if (value?.nome) this.nomeValue.set(value.nome);
  }

  hasChanges = computed(() => {
    return this.nomeValue().trim() !== (this.entidadeOriginal()?.nome || '').trim();
  });

  constructor() {
    addIcons({ checkmarkOutline });
  }

  ngOnInit() {}

  async onSubmit(form: NgForm) {
    if (!form.valid || !this.hasChanges()) return;
    try {
      this.isSubmitted.set(true);
      // Lógica de API...
      this.global.modalDismiss({ sucesso: true });
    } catch (e) {
      this.global.checkMessageForErrorToast(e);
    } finally {
      this.isSubmitted.set(false);
    }
  }
}
```

### Template HTML (.html)
```html
<ion-content>
  <form #f="ngForm" (ngSubmit)="onSubmit(f)">
    <ion-list class="ion-padding-horizontal">
      <ion-item>
        <ion-input 
          label="NOME COMPLETO" 
          labelPlacement="floating" 
          required 
          name="nome"
          [ngModel]="nomeValue()"
          (ionInput)="nomeValue.set(\$event.detail.value)"
          #nome="ngModel">
        </ion-input>
        <ion-icon *ngIf="nome.valid" name="checkmark-outline" slot="end" color="primary"></ion-icon>
      </ion-item>
    </ion-list>

    <div class="ion-padding-horizontal ion-text-center">
      <ion-button *ngIf="!isSubmitted()" expand="block" type="submit" [disabled]="!f.valid || !hasChanges()">SALVAR</ion-button>
      <ion-button *ngIf="isSubmitted()" [disabled]="true">
        <ion-spinner name="crescent"></ion-spinner>
      </ion-button>
    </div>
  </form>
</ion-content>
```

### Estilos (.scss)
```scss
ion-content {
    --background: var(--ion-color-light);
}
.alignSpinner { 
    display: flex; 
    justify-content: center; 
    align-items: center; 
}
```
