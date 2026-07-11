# Info Banner Component Standard Pattern

Este padrão de design define a estrutura do componente `.info-banner`, que é um banner informativo compacto, colorido (baseado no tema primário ou de atenção/aviso) e interativo (recolhível/expandível).

Ele é altamente integrado com o `HelpService` para carregar conteúdo de ajuda estruturado de forma dinâmica.

## 1. Estrutura HTML (Template)
```html
<div class="info-banner ion-margin-bottom">
  <div class="info-banner-header" (click)="infoBannerVisible.set(!infoBannerVisible())">
    <ion-icon name="information-circle-outline" color="primary"></ion-icon>
    <span>{{ helpService.getTopic('customization_multiplier')?.title || 'Ajuda' }}</span>
    <ion-icon [name]="infoBannerVisible() ? 'close-outline' : 'add-outline'" class="toggle-icon"></ion-icon>
  </div>
  @if (infoBannerVisible()) {
    <div class="info-banner-body">
      @for (paragraph of helpService.getTopic('customization_multiplier')?.content; track $index) {
        <p [innerHTML]="paragraph"></p>
      }
    </div>
  }
</div>
```

## 2. Estrutura TypeScript (Componente)
```typescript
import { Component, signal, inject } from '@angular/core';
import { HelpService } from 'src/app/services/help/help.service';

@Component({
  // ...
})
export class SeuComponent {
  public helpService = inject(HelpService);
  public infoBannerVisible = signal<boolean>(false);
}
```

## 3. Estrutura SCSS (Estilo)
```scss
.info-banner {
  margin: 12px;
  border: 1px solid var(--ion-color-primary);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(var(--ion-color-primary-rgb), 0.06);

  .info-banner-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: var(--ion-color-primary);

    ion-icon { font-size: 18px; }
    .toggle-icon { margin-left: auto; }
  }

  .info-banner-body {
    padding: 0 14px 12px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--ion-color-dark);

    p { margin: 6px 0; }
    ::ng-deep strong { color: var(--ion-color-primary); }
    ::ng-deep em { font-style: italic; color: var(--ion-color-medium); }
  }
}
```
