# Padrão de Componentes de Formulário (isEditMode)

Esta documentação descreve as regras para extração e componentização de formulários CRUD na stack Angular/Ionic, visando padronizar o gerenciamento de estados (Criar vs Editar).

## 1. Sinal `isEditMode`
Todos os componentes de formulário isolados devem obrigatoriamente possuir um sinal de entrada para indicar o contexto da operação.

```typescript
import { input } from '@angular/core';

// ...
isEditMode = input<boolean>(false);
```

## 2. Inputs e Outputs Padrão
Além do `isEditMode`, formulários extraídos de modais devem expor:
- `isOpen` (se o componente envolver o modal) ou apenas receber a entidade (`entity = input<Entity | null>(null);`)
- Outputs padrão de ciclo de vida:
  ```typescript
  closed = output<void>();
  saved = output<void>();
  ```

## 3. Comportamento no Template
No template (HTML), utilize o sinal `isEditMode()` para alternar títulos, botões e labels. Nunca valide apenas se a entidade (ex: `editingService()`) existe na UI para inferir edição. Use a propriedade explicitamente projetada para isso.

```html
<ion-title>{{ isEditMode() ? 'Editar Registro' : 'Novo Registro' }}</ion-title>

<!-- ... -->

<button type="submit">
  {{ isEditMode() ? 'Atualizar' : 'Cadastrar' }}
</button>
```

## 4. Inicialização de Formulários com Signals (Angular 18+)
No construtor ou ngOnInit, use o `effect` para observar as mudanças da entidade e do estado de edição.

```typescript
effect(() => {
  const isEditing = this.isEditMode();
  const data = this.entity();
  
  if (isEditing && data) {
    this.form.patchValue(data);
  } else {
    this.form.reset({ status: 'ACTIVE' }); // Defaults
  }
});
```

## 5. Justificativa
O uso de `isEditMode` via Signal Input garante que a responsabilidade do "Modo" (Criar ou Editar) seja controlada de fora (Smart Component / Page) de forma reativa e intencional. Isso evita que o componente de formulário tente "adivinhar" o que fazer com base nos dados, tornando o componente o mais "Dumb" (apresentacional) possível e evitando erros de ciclo de vida do Angular.
