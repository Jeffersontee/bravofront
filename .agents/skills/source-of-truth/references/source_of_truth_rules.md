# Diretrizes de Fonte da Verdade (Source of Truth)

Este documento estabelece as regras e padrões de arquitetura para garantir que os dados trafegados entre o Backend (Node/Mongoose) e o Frontend (Angular/Ionic) possuam apenas **uma única fonte da verdade**, eliminando redundâncias e mapeamentos manuais (gambiarras).

---

## 1. Normalização de Relacionamentos (NoSQL)

* **Evitar Duplicação de Atributos:** Se uma entidade é vinculada a outra através de um ID de relacionamento (ex: `subscription_id` apontando para o contrato, `plan_id` apontando para o plano), **nunca** armazene campos textuais ou redundantes na raiz do modelo principal (ex: evitar `plan_name` ou `plan_price` na coleção `Establishment`).
* **Uso de Populates:** O backend deve expor o relacionamento completo utilizando populate do Mongoose. Se houver dependências multinível, use populate aninhado:
  ```typescript
  .populate({ path: 'subscription_id', populate: { path: 'plan_id' } })
  ```

---

## 2. Padrão de Codificação e Tratamento de Gambiarras (Anti-Patterns)

### Gambiarras Comuns (Detectar e Corrigir):
1. **Fallback de Mapeamento Manual no Backend:**
   * *O que é:* Injetar chaves artificiais no JSON de retorno para encobrir a falta de um populate (ex: `est.plan_name = est.subscription_id?.plan_id?.name || 'Básico'`).
   * *Correção:* Deletar o mapeamento manual do controller e expor apenas as propriedades populadas reais.
2. **Formulários Populados por String no Frontend:**
   * *O que é:* Copiar chaves textuais (como `plan_name`) para preencher campos no formulário reativo.
   * *Correção:* Buscar os dados navegando no objeto populado: `data.subscription_id?.plan_id?.name`.
3. **Mapeamento Posicional Falso no Model do Frontend:**
   * *O que é:* Não tipar chaves relacionais no modelo do frontend para poupar alteração no construtor.
   * *Correção:* Adicionar a propriedade estendida no modelo (ex: `public subscription_id?: any;`) e atribuir após a instanciação no `fromJson`.

---

## 3. Checklist de Auditoria e Refatoração

Sempre que analisar ou criar um novo relacionamento, verifique o seguinte fluxo:

1. [ ] **Model (Mongoose):** O schema contém chaves redundantes? Se sim, remova-as e mantenha apenas os pointers de ObjectId.
2. [ ] **Controllers (Backend):** As consultas (`find`, `findOne`) realizam o `populate` correto de toda a árvore de dados necessária?
3. [ ] **Mappers (Backend):** O objeto retornado possui atribuições de fallback que copiam dados da relação para a raiz? Se sim, elimine-as.
4. [ ] **Aggregations (Backend):** Os pipelines de `$lookup` apontam para o campo correto? (Cuidado com agregados que joinam em chaves deletadas).
5. [ ] **Model (Frontend):** A classe de modelo no front possui a nova chave tipada e mapeada de forma assíncrona?
6. [ ] **Templates HTML (Frontend):** A exibição de valores (badges, spans, labels) está navegando pelas relações (`node.relation?.subrelation?.field`) ou lendo fallbacks redundantes?

Se detectar qualquer desvio dessas regras durante tarefas de codificação, interrompa e sugira a correção estrutural em vez de continuar alimentando o fallback.
