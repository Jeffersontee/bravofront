# Reference: Customização Arquitetural de Estilos Ionic

Proíba práticas invasivas que quebram o encapsulamento nativo de componentes Web baseados em Shadow DOM.

## Diretrizes de Refatoração

### 1. Isolamento de Escopo
* **Proibido:** Uso de seletores profundos como `::ng-deep` ou flags de força bruta como `!important` para tentar estilizar as propriedades internas de componentes nativos do Ionic.
* **Adotar:** **CSS Custom Properties** (Variáveis CSS) expostas formalmente pela API do elemento Ionic (ex: `--background`, `--color`, `--border-radius`).

### 2. Swiper e Carrosséis Modernos
* **Evitar:** Uso do antigo wrapper depreciado `<ion-slides>`.
* **Adotar:** Uso direto dos Web Components oficiais do Swiper (`<swiper-container>` e `<swiper-slide>`). Toda a customização interna de layout (ex: cores das bullets de paginação) deve ser feita exclusivamente injetando propriedades customizadas do Swiper (`--swiper-pagination-color`) no seletor css do container.
