---
name: skeleton-layout
description: Diretrizes de layout, sincronização e dimensionamento de componentes ion-skeleton-text.
---
# Skill: Sincronização de Skeletons (ion-skeleton-text)

Esta skill orienta sobre o desenvolvimento e manutenção de layouts de carregamento por esqueleto (`ion-skeleton-text`) no Ionic/Angular. 

## 🔄 Regra de Ouro da Sincronização

**Sempre que a estrutura HTML de um componente ou cartão de conteúdo for alterada ou redimensionada, a respectiva estrutura e estilos do seu Skeleton DEVE ser atualizada em paridade absoluta.**

### 1. Paridade de Estrutura (HTML)
* O bloco de skeleton deve reproduzir os mesmos elementos wrapper do item carregado (ex: `<ion-card>`, `<ion-item>`, `<ion-thumbnail>`, `<ion-label>`, `<h3>`, `<p>`).
* A ordem e o posicionamento dos blocos devem ser os mesmos para evitar pulos visuais (layout shifts) quando o dado final é renderizado.

### 2. Paridade de Dimensões (SCSS)
* **Thumbnails:** Se o tamanho do thumbnail da imagem real mudar (ex: de `72px` para `64px`), o tamanho do `<ion-thumbnail>` do skeleton deve ser atualizado na mesma medida (ex: definindo explicitamente no seletor a largura/altura correta do parent `ion-thumbnail`).
* **Textos:** Use porcentagens de largura variadas (ex: `60%` para títulos, `85%` para descrições, `45%` para metadados) nas linhas do skeleton para simular texto real e dar um aspecto visual natural de carregamento.
* **Margens:** As margens internas do label (`ion-label`) e o distanciamento entre as linhas do skeleton devem coincidir com o padding e espaçamento do elemento carregado.
