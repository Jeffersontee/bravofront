# 📱 Diretrizes de Mobile Safe Area, Status Bar & Insets (Padrão Notion)

> 💡 **Objetivo:** Estabelecer uma arquitetura padronizada e centralizada para compensação da **Barra de Status (Relógio, Bateria, Notch, Ilha Dinâmica, Wi-Fi)** no topo e da **Barra de Navegação / Tab Bar** na base em dispositivos móveis Android e iOS, garantindo visualização impecável tanto no mobile quanto no desktop.

---

## 🎯 1. O Problema: Por que a Safe Area é necessária?

| Região | Elementos do Sistema | Comportamento sem Safe Area | Impacto no Usuário |
| :--- | :--- | :--- | :--- |
| **Topo (Top Inset)** | Relógio, Sinal Wi-Fi, Bateria, Notch, Dynamic Island, Câmera Frontal | O topo da aplicação sobe até a borda física (`y=0`), ficando sob os ícones do sistema operacional. | Títulos, fotos de perfil, botões de voltar e badges ficam cortados ou ilegíveis. |
| **Base (Bottom Inset)** | Home Indicator (barra de gestos iOS/Android), `ion-tab-bar` inferior | O final da rolagem encosta na base sem margem extra, ou os cards finais ficam escondidos atrás das abas. | O usuário não consegue clicar nos botões ou visualizar os preços dos últimos cards da lista. |

---

## ⚙️ 2. Arquitetura Centralizada (Tokens Globais)

Todas as variáveis de Safe Area estão centralizadas no arquivo raiz [`src/global.scss`](file:///c:/workspace/workspace_bravo-instalacoes/bravofront/src/global.scss):

```scss
/* ============================================================================
   GLOBAL MOBILE SAFE AREA & INSET UTILITIES (src/global.scss)
   ============================================================================ */
:root {
  /* Topo: Compensação padrão para Status Bar (Relógio, Notch, Wi-Fi) */
  --bravo-safe-top: calc(env(safe-area-inset-top, 24px) + 16px);
  --bravo-safe-top-hero: calc(env(safe-area-inset-top, 24px) + 20px);

  /* Base: Compensação para Rodapés, Gestos e Tab Bar Inferior */
  --bravo-safe-bottom: calc(env(safe-area-inset-bottom, 16px) + 24px);
  --bravo-safe-bottom-tabs: calc(env(safe-area-inset-bottom, 16px) + 90px);
}
```

---

## 🛠️ 3. Como Utilizar nos Componentes

### Opção A: Classes Utilitárias no HTML (Recomendado para novos blocos)
```html
<!-- Cabeçalho Hero que precisa de respiro do relógio/notch -->
<div class="safe-hero-header">
  <img src="logo.png" />
  <h2>Olá, Cliente</h2>
</div>

<!-- Container de conteúdo que possui Tab Bar abaixo -->
<div class="safe-tabs-content">
  <!-- Cards e listas roláveis -->
</div>
```

### Opção B: Tokens CSS no SCSS do Componente
```scss
.hero-header {
  /* No Mobile: consome o token global com fallback seguro */
  padding-top: var(--bravo-safe-top-hero);
  padding-left: max(env(safe-area-inset-left, 0px), 20px);
  padding-right: max(env(safe-area-inset-right, 0px), 20px);
  padding-bottom: 48px;

  /* No Desktop: reseta safe areas mobile e centraliza com proporções elegantes */
  @media (min-width: 992px) {
    max-width: 1140px;
    margin: 16px auto 0 auto;
    padding-top: 36px;
    padding-bottom: 56px;
    padding-left: 32px;
    padding-right: 32px;
    border-radius: 28px;
  }
}

.main-content-wrapper {
  margin-top: -24px;
  padding: 0 16px;
  /* Garante que o último card nunca fique encoberto pela tab-bar */
  padding-bottom: var(--bravo-safe-bottom-tabs);

  @media (min-width: 992px) {
    max-width: 1140px;
    margin: -28px auto 0 auto;
    padding: 0 24px 60px 24px;
  }
}
```

---

## 📱 4. Estilização da Tab Bar Inferior (`ion-tab-bar`)

No arquivo [`customer-layout.page.scss`](file:///c:/workspace/workspace_bravo-instalacoes/bravofront/src/app/pages/customer/customer-layout/customer-layout.page.scss):

```scss
ion-tab-bar {
  --background: var(--ion-card-background, #ffffff);
  --border: none;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  height: calc(58px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 1000;

  @media (min-width: 992px) {
    max-width: 760px;
    margin: 0 auto 12px auto;
    border-radius: 24px;
    border: 1px solid rgba(226, 232, 240, 0.9);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    height: 62px;
    padding-bottom: 0;
  }
}
```

---

## ✅ 5. Regras de Ouro e Checklist de Revisão

- [x] **Nunca hardcodear `padding-top: 20px` estático** em telas de tela cheia (`[fullscreen]="true"`). Use sempre `var(--bravo-safe-top)` ou `var(--bravo-safe-top-hero)`.
- [x] **Sempre fornecer fallback em pixels** no `env()`, ex: `env(safe-area-inset-top, 24px)` para garantir renderização correta em Web/PWA onde a variável nativa pode não estar injetada.
- [x] **Páginas com Tab Bar DEVE ter `var(--bravo-safe-bottom-tabs)`** no container final de rolagem.
- [x] **Preservar Desktop Impecável (`≥ 992px`):** No desktop, os limites de tela móvel são substituídos por containers de largura máxima (`max-width: 1140px/1200px`) centralizados (`margin: 0 auto`).
