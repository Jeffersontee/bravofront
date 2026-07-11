# API Envelope Standard & Legacy Cleanups

Este documento serve como a **Fonte da Verdade** para a padronização das respostas de API no ecossistema Adega Pinguins (Backend Node/Express + Frontend Angular/Ionic).

---

## 1. Padrão Absoluto de Resposta (API Envelope)

Todas as requisições HTTP (com exceção de downloads de arquivos binários) devem retornar uma estrutura envelopada consistente. Isso evita inconsistências de tipos no Frontend ao trabalhar com Angular Signals, RXJS Observables e tipagem estrita.

### 1.1. Sucesso (GET, POST, PATCH, PUT, DELETE)
A resposta **DEVE** possuir a propriedade `success: true` e encapsular o recurso dentro do objeto `data`.

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Produto Exemplo"
  }
}
```

Para listas ou paginações:
```json
{
  "success": true,
  "data": [
    { "id": "123", "name": "Produto A" }
  ],
  "total": 1
}
```

Para operações sem retorno de dados (ex: DELETE):
```json
{
  "success": true,
  "message": "Recurso removido com sucesso."
}
```

### 1.2. Respostas de Autenticação (Login / Refresh Token)
O contrato para rotas de autenticação é o mesmo, com as propriedades `token`, `refreshToken` e `user` dentro de `data`:

```json
{
  "success": true,
  "data": {
    "token": "<JWT Access Token>",
    "refreshToken": "<JWT Refresh Token>",
    "user": { "email": "...", "type": "...", ... }
  }
}
```

**Interface no Frontend (`AuthResponse`):**
```typescript
export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    refreshToken: string;
    user: any;
    email_changed?: boolean;
  };
}
```

### 1.3. Erros
Devem usar códigos HTTP adequados e retornar a mensagem no campo `message`:

| Status HTTP | Uso |
|---|---|
| `400` | Requisição inválida / Dados malformados |
| `401` | Token expirado / Não autenticado |
| `402` | Paywall / Plano expirado |
| `403` | Sem permissão / Refresh token inválido |
| `404` | Recurso não encontrado |
| `422` | Erro de validação (campos inválidos) |
| `429` | Rate limiting / Detecção de bot |
| `500` | Erro interno real do servidor |

```json
{
  "message": "Mensagem detalhada do erro para o usuário",
  "status_code": 401
}
```

> **REGRA CRÍTICA**: Erros de **regra de negócio** (senha incorreta, limite atingido, etc.) **NUNCA** devem retornar status `500`. Usar `401`, `422` ou `402` conforme o caso.

---

## 2. Remoção de Legados e Higienização de Tokens

### 2.1. No Backend (Node.js / Express)

**Anti-padrão #1:** Retornar tokens diretamente na raiz:
```typescript
// ❌ INCORRETO (Legado):
return res.status(200).json({
    accessToken: access_token,
    refreshToken: refresh_token
});

// ✅ CORRETO (Padrão):
return res.status(200).json({
    success: true,
    data: {
        token: access_token,
        refreshToken: refresh_token
    }
});
```

**Anti-padrão #2:** Retornar dados úteis sem envelope:
```typescript
// ❌ INCORRETO:
return res.status(200).json({ url: authUrl });

// ✅ CORRETO:
return res.status(200).json({ success: true, data: { url: authUrl } });
```

**Anti-padrão #3:** Usar status `500` para erros de negócio:
```typescript
// ❌ INCORRETO (tratado como crash do servidor pelo frontend):
reject(new Error('Usuário e senha não coincidem'));
// (capturado pelo next(e) → retorna 500)

// ✅ CORRETO:
req.errorStatus = 401;
throw new Error('Usuário e senha não coincidem');
```

### 2.2. No Frontend (Angular / Ionic)

**Anti-padrão:** Acessar diretamente `response.token` ou `response.accessToken` na raiz:
```typescript
// ❌ INCORRETO:
auth.accessTokenSubject.next(response.token);

// ✅ CORRETO:
auth.accessTokenSubject.next(response.data?.token);
```

**Regra de Resiliência (Fallback Temporário):** Durante períodos de transição ou deploys assíncronos entre frontend e backend, implemente uma normalização no operador `map` do Angular/RxJS:
```typescript
map((response: any) => {
  // Fallback: se o backend retornar formato legado sem 'data', envelopa localmente
  if (response && !response.data && response.accessToken) {
    return {
      success: true,
      data: {
        token: response.accessToken,
        refreshToken: response.refreshToken
      }
    };
  }
  return response;
})
```

> **IMPORTANTE:** Este fallback deve ser tratado como **temporário**. Após confirmar que o backend em produção usa o envelope correto, o fallback deve ser removido para manter o código limpo.

---

## 3. Arquivos-Chave para Auditoria

### Backend (`adegapinguinsback`)
| Arquivo | Verificação |
|---|---|
| `src/controllers/UserController.ts` | Login, Signup, RefreshToken, Profile |
| `src/controllers/PaymentOnboardingController.ts` | OAuth callback, URLs de redirecionamento |
| `src/controllers/PaymentController.ts` | Webhooks, checkOrderStatus |
| `src/controllers/EstablishmentController.ts` | CRUD de estabelecimentos |
| `src/controllers/OrderController.ts` | Criação e status de pedidos |
| `src/controllers/ReportController.ts` | Relatórios e gráficos do dashboard |
| `src/controllers/StaffController.ts` | CRUD de colaboradores |

### Frontend (`adegapinguinsfront`)
| Arquivo | Verificação |
|---|---|
| `src/app/services/token-interceptor/token-interceptor.service.ts` | Acesso a `response.data.token` no `switchMap` |
| `src/app/services/auth/auth.service.ts` | `getNewTokens()`, `login()`, `setUserData()` |
| `src/app/interfaces/authResponse.interface.ts` | Tipagem do envelope de autenticação |
| `src/app/services/api/api.service.ts` | Base HTTP client |

---

## 4. Lista de Verificação (Checklist)

Ao revisar ou implementar novas rotas, verificar **obrigatoriamente**:

### Backend
- [ ] O Controller envelopa a resposta de sucesso em `{ success: true, data }` ?
- [ ] Erros de validação usam `req.errorStatus` + `throw new Error()` com código HTTP semântico (401, 422, etc.) ?
- [ ] A rota de `/refresh_token` retorna `{ success: true, data: { token, refreshToken } }` ?
- [ ] Dados sensíveis (tokens OAuth, secrets) são mascarados (`••••`) em respostas de GET ?
- [ ] Não há retorno direto de propriedades na raiz (ex: `{ url: '...' }`, `{ accessToken: '...' }`) ?

### Frontend
- [ ] O Service/Component acessa dados via `response.data` e nunca diretamente na raiz ?
- [ ] O Interceptor de token lê o novo token de `response.data?.token` ?
- [ ] A interface `AuthResponse` está sendo usada para tipar respostas de autenticação ?
- [ ] Fallbacks de resiliência são marcados com `// TODO: remover após migração completa` ?

---

## 5. Legados Conhecidos (Auditados em 2026-07-07)

| Arquivo | Linha | Problema | Status |
|---|---|---|---|
| `UserController.ts` | L587 | `getNewTokens` retornava `{ accessToken, refreshToken }` sem envelope | ✅ Corrigido |
| `PaymentOnboardingController.ts` | L74 | Retorno `{ url: authUrl }` sem envelope | ⚠️ Pendente |
| `token-interceptor.service.ts` | L116 | Acesso a `response.token` em vez de `response.data?.token` | ✅ Corrigido |
| `auth.service.ts` | L249 | `getNewTokens()` sem fallback de normalização | ✅ Corrigido |
