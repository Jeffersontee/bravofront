---
name: component-seeder
description: Instruções de sementeira (Seeding) de perguntas e complementos embutidos para produtos de adega.
---
# Skill: Component Seeder (Perguntas e Adicionais Embutidos)

Esta skill orienta o Seed Agent no mapeamento e geração de perguntas, opcionais, adicionais e complementos embutidos diretamente no modelo de produtos (`Product`).

## 📋 Regra de Negócio e Estrutura

Para gerenciar opcionais embutidos nos produtos da adega (Abordagem 1), o modelo de dados de `Product` possui o campo `questions` (perguntas/adicionais). Cada pergunta é modelada como um subdocumento estruturado:

### Campos da Pergunta (`questions`):
- `title` (String): Título da pergunta/opcional. (Ex: "Deseja gelo e copos?")
- `isRequired` (Boolean): Se o cliente é obrigado a selecionar ao menos uma opção.
- `minOptions` (Number): Mínimo de opções selecionáveis.
- `maxOptions` (Number): Máximo de opções selecionáveis.
- `options` (Array of objects): Opções selecionáveis com os atributos:
  - `name` (String): Nome da opção (Ex: "Saco de gelo 5kg")
  - `price` (Number): Preço adicional (Ex: `12.50` ou `0` para grátis)

## 🎲 Padrão de Geração de Mock Data (Seed)

Ao realizar seeds ou mockar dados de produtos da adega, use os seguintes padrões realistas:

1. **Combos (Ex: Whisky + Energético/Gelo):**
   - Pergunta 1 (Obrigatória, Escolha Única): Sabores do energético. Ex: "Escolha o sabor do Energético" (Red Bull Tradicional, Tropical, Melancia).
   - Pergunta 2 (Opcional, Multi-escolha): Copos e gelo extras.

2. **Bebidas de Garrafa Individuais (Cervejas, Vinhos, Destilados):**
   - Pergunta 1 (Obrigatória, Escolha Única): "Temperatura da Bebida" (Gelada ou Natural).
   - Pergunta 2 (Opcional): "Adicionar Copos e Gelo" com acréscimo de preço.

3. **Petiscos/Comidas de Acompanhamento:**
   - Pergunta 1 (Obrigatória): "Ponto da Carne" (para hambúrgueres e carnes).
   - Pergunta 2 (Opcional): "Adicionar extras" (Bacon, Cheddar, Cebola Caramelizada) com acréscimo de preço.
