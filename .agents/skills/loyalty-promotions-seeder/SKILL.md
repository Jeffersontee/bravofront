---
name: loyalty-promotions-seeder
description: Instruções de sementeira para as coleções de fidelidade e promoções.
---
# Skill: Loyalty & Promotions Database Seeding

Esta skill instrui o Seed Agent do Antigravity a popular de forma realista as novas coleções de **Promoções** e **Fidelidade** no ecossistema Adega Pinguins, garantindo integridade referencial com os dados de testes locais.

## 🔑 Integridade Referencial Obligatória

Os novos schemas dependem de relacionamentos fortes com estabelecimentos e usuários. O seeder deve:
1. Buscar no banco central (`HubDB` / Central Connection) estabelecimentos reais de teste que tenham sido criados previamente.
2. Buscar usuários clientes cadastrados.
3. Utilizar o `_id` desses documentos ao instanciar registros em:
   * `Promotions` (`establishment_id`)
   * `LoyaltyProgram` (`establishment_id`)
   * `LoyaltyProgress` (`user_id` e `establishment_id`)

## 📅 Manipulação de Datas

Os cupons do modelo `Promotions` devem possuir datas de vigência representadas por objetos nativos do JavaScript `ISODate`.
* **Cupons Ativos:** Defina `start_date` como a data atual menos 5 dias, e `end_date` como a data atual mais 15 dias.
* **Cupons Expirados:** Defina `start_date` como a data atual menos 20 dias, e `end_date` como a data atual menos 1 dia, com o status definido como `'expired'`. Isso é crítico para testar as cores dos badges no frontend.

## 🎲 Cenários de Teste Fidelidade

* **LoyaltyProgram:** Gere 1 programa ativo por estabelecimento com `points_per_real: 1`, `min_points_to_redeem: 100`, `reward_type: 'cashback'` e `reward_value: 10`.
* **LoyaltyProgress:** Simule clientes reais com saldos variados para testar o comportamento da barra de progresso no frontend:
  * Cliente A: 25 pontos (barra no início).
  * Cliente B: 90 pontos (barra quase cheia).
  * Cliente C: 120 pontos (saldo suficiente para o resgate de R$ 10,00, ativando o badge de recompensa).
