# Reference: Novo Fluxo de Controle Nativo (Control Flow)

Substitua obrigatoriamente as diretivas estruturais legadas de atributos (`*ngIf`, `*ngFor`, `*ngSwitch`) pela nova sintaxe de blocos nativos.

## Diretrizes de Refatoração

### 1. Condicionais
* **Evitar:** `<div *ngIf="condicao">...</div>`
* **Adotar:** `@if (condicao) { ... }`

### 2. Loops e Iterações
* **Evitar:** `<div *ngFor="let item of lista">...</div>`
* **Adotar:** `@for (item of lista; track item.id) { ... }`
* **Regra Crítica:** A cláusula `track` é obrigatória no bloco `@for`. Use identificadores exclusivos (como `id`). Evite usar `$index` a menos que a lista seja estritamente estática e imutável.
* **Bloco Vazio:** Sempre utilize o bloco `@empty { ... }` acoplado ao `@for` para tratar layouts onde a lista correspondente não possui elementos cadastrados, eliminando checagens manuais de tamanho (`lista.length === 0`).
