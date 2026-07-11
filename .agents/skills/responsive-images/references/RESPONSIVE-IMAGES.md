---
name: responsive-images
description: Diretrizes de estilização e renderização para imagens responsivas sem cortes indesejados.
---

# Skill: Imagens Responsivas e sem Cortes (UI/UX)

Esta skill define as regras de estilo e marcação HTML/CSS para garantir que todas as imagens no ecossistema sejam apresentadas sem cortes, respeitando a proporção original do upload feito pelo usuário.

## 📐 Regras de Ouro para Imagens

1. **Evitar cortes indesejados (`object-fit: contain`):**
   - Em modais de visualização de detalhes, banners informativos ou áreas onde a integridade visual do produto (ex: garrafa inteira, hambúrguer inteiro) é crítica, use **sempre** `object-fit: contain` em vez de `object-fit: cover`.
   - `object-fit: cover` deve ser reservado apenas para miniaturas recortadas (ex: avatares redondos, mini-ícones de lista) onde o corte centralizado é aceitável.

2. **Limitar Altura sem Perder Proporção:**
   - Sempre configure uma altura máxima (`max-height`) juntamente com largura total (`width: 100%`) para garantir que imagens grandes não quebrem a rolagem vertical de telas menores.

### Exemplo Recomendado (SCSS):

```scss
ion-img,
img {
  width: 100%;
  max-height: 240px; /* Ajustável conforme o contexto da seção */
  object-fit: contain; /* Garante que a imagem inteira caiba na caixa sem ser cortada */
  border-radius: 8px;
  margin-bottom: 16px;
}
```

3. **Background Neutro/Suave (Opcional):**
   - Se a imagem puder conter transparências (PNGs), adicione uma cor de fundo sutil (ex: `background-color: var(--ion-color-light, #fafafa);`) para suavizar a mesclagem visual.
