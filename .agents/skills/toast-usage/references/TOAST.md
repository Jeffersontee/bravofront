# Padrões de Uso: Toast e Feedbacks Visuais

No ecossistema do Adega Pinguins (V2), nós utilizamos **sempre** o `GlobalService` (`src/app/services/global/global.service.ts`) para emitir mensagens de toast ou loaders. **NUNCA** injete diretamente o `ToastController` nativo do Ionic nos componentes ou serviços, pois a lógica de UI deve ser centralizada.

## 1. Injeção e Utilização Básica
```typescript
import { Component, inject } from '@angular/core';
import { GlobalService } from 'src/app/services/global/global.service';

export class MeuComponente {
  private global = inject(GlobalService);
}
```

## 2. Métodos Disponíveis

O `GlobalService` fornece atalhos essenciais:

### 2.1 Mensagens de Sucesso
Use sempre que uma ação (como criar, salvar ou atualizar) for bem sucedida.
```typescript
this.global.successToast('Meta de vendas salva com sucesso!');
```

### 2.2 Mensagens de Erro
Use no bloco `catch` de serviços e requisições HTTP.
```typescript
catch (e: any) {
  this.global.errorToast(e.message || 'Ocorreu um erro inesperado');
}
```
**Nota:** O `errorToast()` verifica por padrão a flag de `stop_toast`, e também inclui timeout padrão de 4000ms.

### 2.3 Mensagens de Aviso / Informação
```typescript
this.global.infoToast('Funcionalidade em desenvolvimento');
```

## 3. Tratamento Avançado de Erros (API Envelope)
A maioria dos erros que vem do backend possui uma estrutura específica (`e.error.message`). O `GlobalService` já possui um utilitário para analisar e exibir:
```typescript
this.global.checkMessageForErrorToast(e, 'Falha de comunicação com o servidor');
```

## 4. Regras e Boas Práticas
1. **Evite UiService**: Projetos antigos ou paralelos podem usar `UiService`, mas no `adegapinguinsfront`, a convenção oficial é **GlobalService**. Se esbarrar em código antigo usando `UiService`, refatore para `GlobalService`.
2. **Textos Amigáveis**: Escreva as mensagens pensando no lojista. Evite "Erro 500", prefira "Erro de comunicação com o servidor".
3. **Não polua a tela**: O Toast deve ser pontual. Não dispare toasts múltiplos na mesma ação (isso causa sobreposição).
4. **Tratamento de loading**: Combine o toast com bloqueios no formulário (ex: botões desabilitados usando `[disabled]="isLoading()"`). Evite sobrecarregar com loaders interativos (`showLoader()`) se um spinner simples no botão resolver a experiência de usuário.
