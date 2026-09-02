# LGPD — Lei Geral de Proteção de Dados (Frontend Guidelines)

Este documento estabelece as diretrizes de UX, segurança e conformidade da interface (**Angular / Ionic**) com a **Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)** no ecossistema Bravo Instalações / Adega Pinguins.

---

## 1. Diretrizes de Interface e Experiência do Usuário (Privacy by Design)

1. **Consentimento Explícito (Opt-in):** Os usuários devem concordar expressamente com a Política de Privacidade e os Termos de Uso no momento da criação de conta.
2. **Transparência na Coleta:** Caixas de diálogo e formulários devem indicar claramente o propósito do cadastro.
3. **Acesso Simplificado:** O usuário deve ter acesso fácil à visualização e alteração de seus dados de perfil a partir das configurações de conta.

---

## 2. Formulários e Registro de Consentimento

### Componente de Cadastro (`signup.page` / `company-form`)

Todo formulário de cadastro de usuário ou empresa deve incluir um controle visual de aceite obrigatório dos termos:

```html
<!-- Exemplo de Checkbox de Termos no Ionic/Angular -->
<ion-item lines="none" class="privacy-consent-item">
  <ion-checkbox formControlName="privacy_accepted" slot="start"></ion-checkbox>
  <ion-label class="ion-text-wrap">
    Li e concordo com os <a href="/terms" target="_blank">Termos de Uso</a> e a 
    <a href="/privacy" target="_blank">Política de Privacidade</a>.
  </ion-label>
</ion-item>
```

### Payload de Consentimento
Ao submeter o cadastro, envie a confirmação ao backend:

```typescript
const registerPayload = {
  name: formValue.name,
  email: formValue.email,
  phone: formValue.phone,
  privacy_consent: {
    accepted: formValue.privacy_accepted,
    version: 'v1.0.2026'
  }
};
```

---

## 3. Gerenciamento de Armazenamento Local e Limpeza de Sessão

### 3.1. O que pode ser salvo no `localStorage` / `sessionStorage`:
* **Tokens JWT:** Access Token e Refresh Token de autenticação.
* **Preferências de Interface:** Tema (Light/Dark), preferência de idioma ou filtros ativos.

### 3.2. O que NUNCA deve ser armazenado em texto claro no navegador:
* Senhas em texto puro.
* Dados de cartão de crédito.
* Dados pessoais sensíveis sem necessidade operacional imediata.

### 3.3. Limpeza de Sessão no Logout (`AuthService`)
Ao realizar o encerramento de sessão, limpe ativamente todo o cache e tokens do navegador:

```typescript
async logout() {
  localStorage.clear();
  sessionStorage.clear();
  // Redireciona para login limpando histórico
  this.router.navigateByUrl(Strings.LOGIN, { replaceUrl: true });
}
```

---

## 4. Central de Privacidade do Titular (Self-Service Privacy)

Na tela de conta/perfil do usuário (`AccountForm` / `ProfilePage`), disponibilizar atalhos para que o usuário exerça seus direitos:

### 4.1. Exportação de Dados (Portabilidade - Art. 18, V)
Botão para o usuário baixar um arquivo JSON com seus dados pessoais e histórico:

```typescript
exportData() {
  this.userService.exportMyData().subscribe({
    next: (response) => {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus-dados-bravo-${Date.now()}.json`;
      a.click();
      this.global.successToast('Download dos seus dados iniciado!');
    },
    error: () => this.global.errorToast('Erro ao exportar dados.')
  });
}
```

### 4.2. Solicitação de Exclusão / Anonimização (Direito ao Esquecimento - Art. 18, VI)
Oferecer opção de exclusão com modal de confirmação explicativo:

```typescript
async requestAccountDeletion() {
  const confirmed = await this.global.showButtonToast(
    'Atenção: A exclusão de conta irá anonimizar seus dados pessoais. Deseja continuar?'
  );

  if (confirmed) {
    this.userService.deleteMyAccount().subscribe({
      next: () => {
        this.global.successToast('Sua conta foi desativada e anonimizada.');
        this.authService.logout();
      }
    });
  }
}
```

---

## 5. Máscaras e Proteção Visual de Dados Sensíveis

1. **Campos de Senha:** Utilizar obrigatoriamente `type="password"` com controle reativo via Signal (`passwordVisible = signal(false)`).
2. **Exibição Parcial:** Evitar exibir dados completos de documentos em listagens públicas. Mascarar CPFs e Telefones quando o contexto for de simples visualização.

---

## 📋 Checklist de Conformidade LGPD (Frontend)

- [ ] Checkbox explícito de aceite dos Termos de Uso e Política de Privacidade nos formulários de cadastro.
- [ ] Links visíveis para as páginas de Termos e Política de Privacidade no rodapé e telas de login/cadastro.
- [ ] Limpeza total de `localStorage` e `sessionStorage` na função de Logout.
- [ ] Funcionalidade para o usuário solicitar o download dos seus dados (Portabilidade).
- [ ] Fluxo de confirmação para solicitação de exclusão/anonimização de conta.
- [ ] Mascaramento apropriado de senhas e dados sensíveis na interface.
