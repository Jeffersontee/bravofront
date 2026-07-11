# Reference: Responsive Utility SCSS Reference

Este arquivo serve como referência de estilização CSS/SCSS para o tratamento de imagens responsivas no ecossistema Adega Pinguins. Ele resolve problemas comuns de esticamento, cortes indesejados (`crop`) de rótulos/produtos e estouro de layout em telas pequenas.

## 🎨 Global Utilities (SCSS)

Adicione ou replique estas classes utilitárias no seu arquivo de estilos globais (`src/global.scss`) para reaproveitamento em todo o app Ionic:

```scss
/* ==========================================================================
   IMAGE UTILITIES - RESPONSIVE & UNCROP PATTERNS
   ========================================================================== */

/* Padrão para imagens de produtos/garrafas que NÃO podem sofrer cortes */
.img-contain {
  width: 100%;
  height: auto;
  object-fit: contain;
  background-color: var(--ion-color-light, #fafafa);
  border-radius: 8px;
  transition: opacity 0.3s ease-in-out;
}

/* Limitadores de Altura por Contexto Visual */
.img-banner-max {
  max-height: 240px;
}

.img-product-max {
  max-height: 180px;
}

.img-thumbnail-max {
  max-height: 120px;
}

/* Utilitário para centralizar imagens dentro de flex containers */
.img-container-center {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
}

/* Padrão Exclusivo para Avatares e Miniaturas circulares (Onde o corte é aceitável) */
.img-avatar-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
```

## 📝 Casos de Uso Práticos (Exemplos Aplicados)

### Caso 1: Banner Detalhe do Estabelecimento ou Produto

Garante que a foto de capa ou imagem principal ocupe a largura total, mas limite o tamanho vertical em telas grandes (evitando que o usuário precise rolar a tela apenas para passar da foto).

```scss
.product-detail-cover {
  @extend .img-contain;
  @extend .img-banner-max;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
```

### Caso 2: Grid de Produtos / Card de Itens

Ideal para listagens onde garrafas, latas ou combos precisam aparecer inteiros dentro do quadrado do card, independente da proporção original enviada para o Cloudinary.

```scss
.card-product-thumbnail {
  @extend .img-container-center;
  height: 180px; /* Força um container quadrado/proporcional */

  img,
  ion-img {
    @extend .img-contain;
    @extend .img-product-max;
  }
}
```
