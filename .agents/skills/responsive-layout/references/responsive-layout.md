# Diretrizes de Responsividade Mobile & Desktop (Bravo Instalações)

Este documento estabelece as regras e padrões de design responsivo para o desenvolvimento de telas, componentes e layouts no ecossistema Bravo Instalações.

---

## 1. Breakpoints Padrão
Sempre utilize a escala de breakpoints unificada abaixo para garantir consistência visual em SCSS e JS/TS:

| Breakpoint | Largura Mínima | Dispositivo Alvo |
|---|---|---|
| **xs** | `< 576px` | Smartphones pequenos |
| **sm** | `576px` | Smartphones em geral |
| **md** | `768px` | Tablets pequenos |
| **lg** | `992px` | Desktops normais / Tablets grandes |
| **xl** | `1200px` | Desktops grandes (Widescreen) |

---

## 2. CSS / SCSS Responsivo

### 2.1. Mobile-First (Recomendado)
Escreva os estilos padrões focando no mobile e adicione melhorias para telas maiores usando media queries `@media (min-width: ...)`:

```scss
// Estilo padrão (Mobile)
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

// Melhoria para Desktop (Telas grandes)
@media (min-width: 992px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 2.2. Grid e Flexbox Flexíveis
*   **CSS Grid (Auto-fit)**: Ideal para listagens de cards responsivos sem precisar de breakpoints rígidos:
    ```scss
    .cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    ```
*   **Flex-wrap**: Garanta que flex containers se comportem bem no mobile:
    ```scss
    .header-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: space-between;
    }
    ```

---

## 3. Responsividade Reativa (TypeScript/Angular)

Quando a interface precisa renderizar componentes ou alterar estados de forma diferente baseado no tamanho da tela, utilize o decorator `@HostListener` ou o `BreakpointObserver` do Angular:

### Exemplo com `HostListener`:
```typescript
import { Component, OnInit, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-responsive-comp',
  templateUrl: './responsive-comp.component.html'
})
export class ResponsiveComponent implements OnInit {
  isDesktop = signal<boolean>(window.innerWidth >= 992);

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isDesktop.set(event.target.innerWidth >= 992);
  }
}
```

---

## 4. Práticas Específicas do Ionic
*   **Split Pane**: Utilize `when="lg"` no `<ion-split-pane>` para que o menu vire gaveteiro automático abaixo de 992px de largura.
*   **Layout Helpers**: Use classes utilitárias do Ionic como `.ion-hide-lg-up` (ocultar no desktop) e `.ion-hide-lg-down` (ocultar no mobile) para otimizar a DOM.
*   **Inputs modernos**: Sempre utilize `<ion-input labelPlacement="stacked" ...>` ou `floating` para evitar problemas de overflow de container de rótulos.
