# Padrão de Criação de Componentes e Páginas (Ionic Angular Standalone + Signals)

Sempre crie novos componentes e páginas seguindo estritamente as diretrizes de arquitetura reativa, performance e experiência visual descritas abaixo.

## Regras de Estrutura do Arquivo TypeScript (.ts)
1. **Componentes Standalone**: Todos os novos componentes e páginas devem ser declarados como `standalone: true`. Mapeie explicitamente em `imports: [...]` apenas os módulos necessários (ex: `CommonModule`, e os componentes específicos do `@ionic/standalone`).
2. **Injeção de Dependências Moderna**: Utilize a função `inject()` do Angular em vez de injetar dependências diretamente pelo método `constructor`.
3. **Gerenciamento de Estado Reativo (Signals)**: Utilize obrigatoriamente a API de **Signals** (`signal()`, `computed()`) para controlar o estado da tela (ex: `isLoading = signal(true)` ou dados recebidos por requisição). Evite o uso de variáveis normais ou fluxos complexos com observables sem o pipe `async` para renderizar estados primitivos.

## Regras de Estrutura do Template HTML (.html)
1. **Estado de Carregamento Obrigatório**: Toda tela ou bloco que dependa de requisições HTTP deve possuir uma cópia exata do seu esqueleto visual utilizando `<ion-skeleton-text animated>` orientado pelo signal `*ngIf="isLoading()"`.
2. **Padrão de Layout Grid**: Use a estrutura de `<ion-grid>`, `<ion-row>` e `<ion-col>` para controle de alinhamento e espaçamento interno.
3. **Classes Utilitárias Visuais**: Utilize as classes de borda customizadas do ecossistema do projeto para separação visual de sessões:
   - `class="borderBottom"` para divisões principais de blocos.
   - `class="dashedBorderBottom"` para separadores internos suaves ou itens de listas.

## Exemplo de Referência Completo

### TypeScript (.ts)
```typescript
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/standalone';
import { AlgumServico } from '../../services/algum.service';

@Component({
  selector: 'app-exemplo-funcionalidade',
  templateUrl: './exemplo-funcionalidade.component.html',
  styleUrls: ['./exemplo-funcionalidade.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ExemploFuncionalidadeComponent implements OnInit {
  private meuServico = inject(AlgumServico);

  public data = signal<any>(null);
  public isLoading = signal<boolean>(true);

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.isLoading.set(true);
    this.meuServico.getDados().subscribe({
      next: (res) => {
        this.data.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
```

### Template HTML (.html)
```html
<!-- Bloco de Carregamento (Skeleton) -->
<ion-grid class="borderBottom" *ngIf="isLoading()">
  <ion-item lines="none" class="ion-padding-horizontal dashedBorderBottom">
    <ion-label>
      <h1><ion-skeleton-text style="width: 50%" animated></ion-skeleton-text></h1>
      <p><ion-skeleton-text style="width: 80%" animated></ion-skeleton-text></p>
    </ion-label>
  </ion-item>
</ion-grid>

<!-- Bloco de Conteúdo Real -->
<ion-grid *ngIf="data() && !isLoading()" class="borderBottom">
  <ion-row class="ion-padding-horizontal dashedBorderBottom">
    <ion-label>
      <h1 class="ion-no-margin">{{ data()?.name }}</h1>
    </ion-label>
  </ion-row>
</ion-grid>
```
