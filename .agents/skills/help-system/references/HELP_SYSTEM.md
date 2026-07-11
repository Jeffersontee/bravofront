# Help System (Sistema Centralizado de Ajuda)

Para evitar textos soltos em HTMLs e manter a consistência da comunicação em todo o ecossistema Pinguins, foi criado um **Sistema Centralizado de Ajuda**. Todos os textos instrutivos, explicações de cálculo e tutoriais devem residir no `HelpService`.

## 1. Localização e Estrutura
- **Serviço Central**: `src/app/services/help/help.service.ts`
- **Página de Visualização Geral (Central de Ajuda)**: `src/app/pages/help/help.page.ts`

O serviço expõe um Angular Signal `helpTopics` contendo uma lista de objetos do tipo `HelpTopic`:
```typescript
export interface HelpTopic {
  id: string;          // Identificador único do tópico (ex: 'product_ingredients')
  title: string;       // Título principal do alerta ou acordeão
  content: string[];   // Lista de parágrafos. Suporta marcações HTML simples (<strong>, <em>)
}
```

## 2. Adicionando Novos Tópicos
Nunca coloque textos explicativos longos diretamente nos arquivos `.html`. Sempre adicione o novo tópico ao array `helpTopics` do `HelpService`:

```typescript
    {
      id: 'nova_funcionalidade',
      title: 'Como funciona a Nova Funcionalidade?',
      content: [
        'O primeiro parágrafo descreve o comportamento principal.',
        'O segundo parágrafo detalha <strong>regras específicas</strong> ou exceções.'
      ]
    }
```
*A página principal `HelpPage` automaticamente renderizará o novo tópico como um acordeão (ion-accordion).*

## 3. Consumindo em Componentes (Banners/Tutoriais Inline)
Se você precisar exibir as regras de um tópico dentro de um formulário ou página específica (como um info-banner), siga este padrão:

### No TypeScript do Componente:
Injete o serviço de ajuda e crie um signal de controle de visibilidade, se for um banner colapsável:
```typescript
import { inject, signal } from '@angular/core';
import { HelpService } from 'src/app/services/help/help.service';

// ... dentro da classe do componente
public helpService = inject(HelpService);
public infoBannerVisible = signal(false);
```

### No HTML do Componente:
Utilize o método `getTopic(id)` do serviço para buscar o título e iterar sobre o array de `content`. Empregue a sintaxe `@for` do Angular e a diretiva `[innerHTML]` para suportar a formatação (ex: tags `<strong>`).
```html
<div class="info-banner">
  <div class="info-banner-header" (click)="infoBannerVisible.set(!infoBannerVisible())">
    <ion-icon name="information-circle-outline" color="primary"></ion-icon>
    <span>{{ helpService.getTopic('meu_topico_id')?.title || 'Ajuda' }}</span>
    <ion-icon [name]="infoBannerVisible() ? 'close-outline' : 'add-outline'" class="toggle-icon"></ion-icon>
  </div>
  
  @if (infoBannerVisible()) {
  <div class="info-banner-body">
    @for (paragraph of helpService.getTopic('meu_topico_id')?.content; track $index) {
      <p [innerHTML]="paragraph"></p>
    }
  </div>
  }
</div>
```

## 4. Regras de Estilização
Se for utilizar o formato `info-banner`, garanta que o arquivo SCSS do componente possua o padrão visual da marca:

```scss
.info-banner {
  margin: 12px;
  border: 1px solid var(--ion-color-primary);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(var(--ion-color-primary-rgb), 0.06);

  .info-banner-header {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; cursor: pointer;
    font-size: 13px; font-weight: 600;
    color: var(--ion-color-primary);
    
    ion-icon { font-size: 18px; }
    .toggle-icon { margin-left: auto; }
  }

  .info-banner-body {
    padding: 0 14px 12px;
    font-size: 13px; line-height: 1.6;
    color: var(--ion-color-dark);
    
    p { margin: 6px 0; }
    ::ng-deep strong { color: var(--ion-color-primary); }
    ::ng-deep em { font-style: italic; color: var(--ion-color-medium); }
  }
}
```

## 5. Manutenção de Rotas
A página mestre da Central de Ajuda já está configurada nas rotas principais do painel:
- `ADMIN_HELP`: `/establishment-admin/help`
- `SUPER_HELP`: `/super-admin/help`

Não é necessário criar novas páginas para tópicos simples, apenas centralize-os via `HelpService`.
