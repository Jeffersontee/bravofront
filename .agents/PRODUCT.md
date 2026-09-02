# PRODUCT.md — Diretrizes de Produto, UX/UI, Temas e Design System (Bravo Instalações)

## 📌 Visão Geral do Produto
O **Bravo Instalações** é uma plataforma SaaS multi-tenant voltada para o gerenciamento de serviços de instalação, empresas parceiras, colaboradores de campo e faturamento.

---

## 🎨 1. Sistema de Aparência, Temas e Identidade Visual (`AppearancePage`)
O ecossistema utiliza o `ThemeService` para dinamizar e persistir a identidade visual do Super Admin e das Empresas/Lojistas:

### A. Papéis e Escopo de Configuração:
- **Super Admin (`/super-admin/settings/appearance`):** Define a marca global, cor primária da plataforma, o menu do Super Admin e a personalização da **Tela de Login (`/login`) & Preview de Login**.
- **Empresa / Lojista (`/company/settings/appearance`):** Controla a logomarca da empresa, a cor principal da sua conta, o menu do Lojista e a atmosfera de apresentação.

### B. Comportamento Rígido de Temas (Menu Lateral & Painéis):
1. **`Premium Branco` (Default Global):**
   - **Menu Lateral (`ion-menu`):** Fundo **BRANCO (`#ffffff`)**.
   - **Fontes do Menu:** Tons de cinza elegante (`#475569`, `#64748b`).
   - **Item Selecionado/Ativo:** Texto e ícones destacados na **Cor Principal (`var(--ion-color-primary)`)** com fundo translúcido `rgba(var(--ion-color-primary-rgb), 0.12)`.
   - **Cabeçalho:** Fundo branco com título em grafite `#1e293b`.
2. **`Premium Escuro`:**
   - **Menu Lateral (`ion-menu`):** Fundo **PRETO (`#141414`)**.
   - **Fontes do Menu:** Tons de prata e cinza claro (`#cbd5e1`, `#94a3b8`).
   - **Item Selecionado/Ativo:** Texto e ícones destacados na **Cor Principal (`var(--ion-color-primary)`)** com fundo translúcido `rgba(var(--ion-color-primary-rgb), 0.2)`.

### C. Botão de Salvar Alterações:
- O painel de Aparência **DEVE** exibir o botão destacado **"SALVAR ALTERAÇÕES"** no final da coluna de controles e fixado no rodapé inferior.

---

## 🔐 2. Padrão da Tela de Login (`/login`)
A Tela de Login real segue o **Layout Hero Header**:
1. **Hero Header:** Cabeçalho escuro superior com imagem de fundo, logotipo Bravo Instalações, título *"Serviços técnicos para sua casa, com agilidade e garantia."* e texto em destaque na cor primária `var(--ion-color-primary)`.
2. **Cartão Flutuante de Formulário:** Card branco sobreposto (`.floating-form-wrapper`) com *"Acesse sua conta"*, campos de E-mail (`mail-outline`) e Senha (`lock-closed-outline` + botão de olho), link *"Esqueceu sua senha?"*, botão de envio *"Entrar"* (preenchido com a cor primária quando válido) e link de inscrição.

---

## 📱 3. Padrão de Responsividade Mobile
1. **Cards KPI / Métricas:**
   - Em telas pequenas (`< 992px`), os cards de métricas **DEVEM** ser exibidos em **2 colunas justificadas lado a lado** (`grid-template-columns: repeat(2, 1fr)` com `gap: 10px` a `12px`).
   - Jamais empilhar cards KPI em 1 coluna vertical gigante no mobile.
2. **Botão Hambúrguer Mobile:**
   - Botão de menu com área de toque mínima de `46px × 46px` localizado em um topo flexível (`.mobile-header-bar`), sem sobrepor títulos de texto.
3. **Containers e Prevenção de Overflow:**
   - Todo container deve conter `width: 100%; max-width: 100%; box-sizing: border-box; overflow-x: hidden;`.
   - Gráficos (Chart.js) devem obrigatoriamente possuir `maintainAspectRatio: false` e `canvas { max-width: 100% !important; }`.

---

## 🖥️ 4. Padrão de Responsividade Desktop
1. **Cards KPI Ampliados:**
   - Em telas grandes (`≥ 992px`), a grade de métricas expande para **4 ou 6 colunas** (`grid-template-columns: repeat(4, 1fr)` com `gap: 20px`).
2. **Menu Lateral Responsivo (`ion-split-pane`):**
   - O menu lateral suporta recolhimento/expansão suave (`isCollapsed`), alternando entre `260px` (expandido) e `72px` (compacto apenas com ícones centralizados).
