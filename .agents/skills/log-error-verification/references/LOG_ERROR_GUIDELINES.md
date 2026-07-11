# Diretrizes para Verificação de Logs e Auditoria de Erros

Este documento descreve as práticas recomendadas e os padrões exigidos para registrar logs de auditoria (`SaaSAudit`) e tratar erros no ecossistema Adega Pinguins (Backend e Frontend).

## 1. Registro de Logs de Auditoria no Backend

Todas as ações críticas do sistema, especialmente falhas em operações administrativas ou financeiras, devem ser registradas através do `AuditService`.

### 1.1. Estrutura do Log de Auditoria

Ao registrar um log, utilize o método `AuditService.log(req, data)` com as seguintes chaves:
- `action`: Um identificador em uppercase separado por underscores (ex: `CREATE_ESTABLISHMENT_FAILED`).
- `module`: O módulo relacionado (ex: `establishments`, `payments`, `products`).
- `severity`:
  - `info`: Logs informativos gerais.
  - `warn`: Avisos importantes, sem interrupção de fluxo.
  - `error`: Erros tratados.
  - `critical`: Erros graves/falhas de sistema (disparam alertas automáticos via e-mail e push para o Super Admin).
- `details`: Objeto contendo dados relevantes da operação. **Atenção:** Nunca salve senhas ou tokens em texto limpo. Use máscaras (ex: `••••••••`).

### 1.2. Exemplo de Implementação

```typescript
try {
    // Código do controlador...
} catch (e: any) {
    await AuditService.log(req, {
        action: 'CREATE_ESTABLISHMENT_FAILED',
        module: 'establishments',
        severity: 'critical',
        details: {
            error: e.message || String(e),
            stack: e.stack,
            payload: req.body ? { ...req.body, password: '••••••••' } : {}
        }
    });
    next(e);
}
```

## 2. Tratamento de Erros no Frontend

No frontend, utilize o `GlobalService` para processar e exibir erros vindos das APIs:
- Para capturar e exibir mensagens amigáveis baseadas no envelope de resposta:
  ```typescript
  try {
      await this.establishmentService.addEstablishment(formData);
  } catch (e) {
      this.global.checkMessageForErrorToast(e);
  }
  ```

## 3. Fluxo de Verificação de Logs

1. Acessar o banco central `hubdb` no cluster Mongo.
2. Consultar a coleção `saasaudits` para verificar os logs gerados em tempo real.
3. Filtrar logs críticos (`severity: 'critical'`) para atuar de forma proativa antes que o lojista note o problema.
