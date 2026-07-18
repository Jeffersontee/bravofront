# Regras de Contexto - Adega Pinguins Front

## 1. Tecnologias e Versões
- **Framework:** Angular 18+ com Ionic 7+.
- **Componentes:** Usar estritamente **Standalone Components**. Não criar novos módulos (`NgModule`) a menos que seja estritamente necessário por bibliotecas legadas.
- **Estado:** Usar estritamente **Angular Signals** para gerenciamento de estado reativo e propriedades de componentes. Evitar o uso direto de `Subscription` para gerenciar o estado reativo em componentes, preferindo `effect()` ou `computed()`.
- **Entradas/Saídas:** Utilizar `input()`, `input.required()` e a nova API `output()` do Angular 18.
- **Ícones:** Usar `ionicons`. Sempre registrar os ícones necessários no construtor do componente via `addIcons`.
- **Respostas do Assistente:** Todas as respostas fornecidas pelo assistente de codificação devem ser em Português do Brasil (pt-BR).
- **Gestão de Variações e Insumos:**
  - **Hierarquia:** 
    - `Item` (Insumo): Matéria-prima básica (ex: Pão, Carne). Não possui variações.
    - `ProductType` (Tipo): Embalagem/Apresentação (ex: Garrafa, Lata, Pizza).
    - `ProductSize` (Tamanho): Volume/Dimensão (ex: 600ml, Brotinho).
    - `Variation`: O vínculo em `Product` que define o preço e estoque da combinação Tipo+Tamanho.
  - **Regra:** Produtos de venda devem usar `variations[]`. Insumos usam campos root simples.
  - **Componentes:** Formulários devem usar `input()` signals para `isEditMode` e `isLoading`.

## 2. Padrões de Código e Nomenclatura
- **Formulários Reativos e Estados Disabilitados:** Nunca utilizar o atributo HTML `[disabled]` em elementos que possuem a diretiva `formControlName`. O estado de habilitação/desabilitação deve ser controlado exclusivamente via TypeScript através dos métodos `.enable()` e `.disable()` do controle (ou definindo `{ value: '', disabled: true }` na criação). Isso evita erros de ciclo de vida do Angular (*ExpressionChangedAfterItHasBeenCheckedError*).
- **Leitura de Dados de Formulários:** Ao enviar formulários que possuam campos desabilitados, utilizar sempre `this.form.getRawValue()` em vez de `this.form.value` para garantir que as propriedades desabilitadas não sejam omitidas no payload enviado ao backend.
- **Sincronização de Combos Dependentes (Selects):** Quando um select depender do valor de outro (ex: Tamanhos que mudam conforme o Tipo escolhido), escutar a alteração de valor usando `.valueChanges.subscribe()` no TypeScript. Toda mudança no campo pai deve resetar o valor do campo filho (`.setValue('', { emitEvent: false })`) e recalcular imediatamente sua lista de opções para evitar cache visual ou inconsistência de dados.
- **Vínculo Tipo e Tamanho (Edição/Criação):** O Tipo é rigidamente vinculado ao Tamanho. Se o usuário mudar o Tipo, o campo de Tamanho deve ser resetado imediatamente e habilitado apenas se existirem tamanhos vinculados ao novo tipo.
- **Strings e Rotas:** Nunca hardcodear URLs no código ou templates. Usar sempre o Enum `Strings` localizado em `src/app/enum/strings.ts`.
- **Idiomas:** O projeto é em Português do Brasil (pt-BR). Mensagens de erro e labels devem seguir este idioma.
- **Padrão de Injeção:** Usar a função `inject(Service)` para injeção de dependências em vez de injetar no construtor sempre que possível (padrão moderno do Angular).

## 3. Estrutura de Pastas
- **Layouts:** Localizados em `src/app/pages/super/super-layout` ou `src/app/pages/company/company-layout`.
- **Módulos de Faturas (Invoices):** 
  - **Página Unificada:** `src/app/pages/payments` (Gerencia tanto a visão Super Admin quanto Admin Lojista).
  - **Serviço Central:** `src/app/services/payment/payment.service` (Responsável por toda a lógica de faturas e pagamentos).
  - Componente de Listagem: `src/app/components/invoice-list` (UI reutilizável).
- **Componentes Globais (`src/app/components`):**
  - `category/`: Componente genérico para categorias (Item ou Insumo).
  - `product/` e `product-list/`: Exibição de produtos de venda.
  - `item/` e `item-list/`: Itens gerais do sistema.
  - `product-variations/`: Componente isolado para gerenciamento dinâmico de FormArrays de variações de preço, custo e estoque.
- **Serviços:** `src/app/services`.

## 4. Engenharia de Componentes Reutilizáveis
- **Componentização Genérica:** Para entidades com comportamentos similares (ex: categorias de itens vs. categorias de insumos), deve-se usar um único componente que aceita um parâmetro de contexto (`type`) via Signal Input.
- **Smart vs Dumb Components:** Páginas (`src/app/pages`) gerenciam dados e serviços. Componentes (`src/app/components`) devem ser preferencialmente "dumb" (apresentacionais), recebendo dados via `input()` e emitindo ações via `output()`.
- **Mapeamento de Sub-documentos Populados:** Ficar atento ao formato de dados retornado por relacionamentos do Mongoose (MongoDB). Se uma propriedade de relacionamento (ex: `product_sizes_id` dentro of a `Type`) já vier populada como um array de objetos completos do backend, evite filtros globais redundantes e consuma a coleção de objetos diretamente no laço `@for` do HTML.

## 5. Regras de Roteamento
- As rotas do Super Admin estão em `src/app/pages/super/super-admin.routes.ts`.
- Seguir o padrão de carregamento preguiçoso (`loadComponent`) para todas as rotas filhas.
- Evitar passar `undefined` para `[routerLink]`. Se um item de menu não tiver URL, deve ser tratado como um item de ação ou expansor de submenu.

## 6. Integração de Gateways (Mercado Pago / OAuth)
- O backend espera um payload de `payer` muito específico.
- Campos obrigatórios: `email`, `first_name`, `last_name` e `identification` (CPF).
- Consultar sempre `DEBUG_MERCADO_PAGO_BACKEND.md` para detalhes sobre validação de payloads.
- **Fluxo OAuth:** A gestão de conectividade (saúde do token) deve ser feita em `PaymentGatewayPage`. A escolha do gateway ativo deve ser feita em `PaymentSettingsPage`.
- **Query Params:** Ao retornar do OAuth, tratar os parâmetros `status=success` ou `status=failure` reativamente e limpar a URL em seguida usando `replaceUrl: true`.

## 6. Tratamento de Erros
- Erros de roteamento como `NG04002` geralmente indicam falha na resolução de enums em `Strings`.
- Sempre verificar se a rota destino existe no arquivo de rotas correspondente antes de sugerir um link.
- **Erro de Rota 'null/undefined':** Garantir que `[routerLink]` receba `null` em vez de `undefined` para itens de menu sem URL.

## 7. UI/UX (Ionic)
- Manter o padrão visual do Ionic com `ion-app`, `ion-split-pane` e `ion-menu`.
- Submenus em menus laterais devem usar o estado `open` para controlar a visibilidade dos filhos.
- **Comportamento de Seletores do Ionic:** Componentes `<ion-select>` podem reter dados em cache visual de renderização passiva se as coleções mudarem de tamanho abruptamente. Nesses cenários, indexe as coleções de suporte por linha no TypeScript (ex: `filteredSizesByRow[index]`) para forçar o Angular a renderizar novas referências de memória.
- **Estilização:** Evitar estritamente o uso de estilos inline (`style="..."`) nos templates HTML. Toda a lógica visual deve ser consolidada no arquivo SCSS do componente, utilizando classes semânticas para garantir a separação de responsabilidades e facilitar a manutenção.

## 8. Notas de Debug Recentes
- **Erro de reatividade no FormArray:** Resolvido ao mapear as listas de tamanhos de forma indexada (`filteredSizesByRow`) no TypeScript, disparando as atualizações através do hook de eventos `(ionChange)` do Tipo.
- **Aviso de Controle Desabilitado:** Eliminado ao transferir a lógica de bloqueio de campos do atributo HTML `[disabled]` diretamente para as funções `.enable()` e `.disable()` dos controles reativos.
- **Erro super-admin/undefined:** Corrigido ao garantir que itens de menu pai não tentem navegar e possuam `url: null`.
- **KPIs:** A rota do Super Admin para KPIs deve apontar para o componente correto no sistema de arquivos.
- **Refatoração:** Componente de edição de perfil movido de `src/app/components/profile/edit-profile` para `src/app/components/account-form` para simplificar a hierarquia.
- **Segurança:** Implementado `establishmentOwnerGuard` para isolar dados de pagamento entre estabelecimentos.
- **Account vs Profile:** `AccountPage` gerencia sessão e pedidos de cliente; `AccountForm` é o componente reutilizável para edição de dados de identidade.
- **Multi-Gateway:** Estrutura preparada para Stripe e Mercado Pago coexistirem.

## 9. Processo de Desenvolvimento
- **Verificação de Alterações:** Todas as alterações no código devem ser verificadas e revisadas antes de serem aplicadas ou mergeadas, garantindo a qualidade e a conformidade com os padrões do projeto.

## 📋 Regra de Criação de Features (Checklist Completo)
Sempre que for solicitada a criação ou modificação de uma nova feature ou módulo, o plano de implementação (`implementation_plan.md`) DEVE incluir obrigatoriamente a verificação e alteração das seguintes camadas:
1. **Model (Backend):** Criação dos schemas fortemente tipados em arquivos separados.
2. **Controller (Backend):** Regras de negócio e envelopamento das respostas em `{ success: true, data }`.
3. **Router (Backend):** Configuração do Express Router seguindo a classe padrão com injeção de middlewares.
4. **Server Mount (Backend):** Importação e montagem do roteador no arquivo `src/server.ts`.
5. **Strings (Frontend):** Registro dos enums de rotas e endpoints de API.
6. **Routes (Frontend):** Registro das novas rotas de páginas no roteamento do Angular.
7. **Components/Pages (Frontend):** Desenvolvimento usando Angular moderno (inject, signals, standalone) e Ionic.
8. **Layout & Menu (Frontend):** Inclusão física e correta dos novos links no menu de navegação lateral (`company-layout`, `super-layout`, etc.).
9. **Seeder (Automação):** Geração ou alteração de seeds realistas com integridade referencial.
10. **Assinatura (Backend):** Todo estabelecimento, quando criado via Super Admin, deve gerar automaticamente sua assinatura no modelo `Subscription`. Se o plano for `Trial`, a assinatura recebe `trialing`. Se for um plano pago (Premium/Lite), a assinatura já é gerada imediatamente como `active`.

## 10. Arquitetura de Skills (Customizations)
Sempre que for solicitada a criação ou atualização de uma **Skill**, a seguinte arquitetura de pastas é OBRIGATÓRIA:
- **Pasta da Skill:** `.agents/skills/<nome-da-skill>/`
- **Arquivo SKILL.md:** Deve ser extremamente conciso, contendo apenas o *Frontmatter (YAML)* e uma referência (link) para a documentação real.
- **Pasta References:** `.agents/skills/<nome-da-skill>/references/`
- **Arquivo de Referência:** O conteúdo extenso da skill deve ser salvo em um arquivo `.md` dentro da pasta `references/` e referenciado (link) pelo `SKILL.md` principal.
- **Validação Automática:** Para garantir o cumprimento dessa regra, existe o script `update-skills.ts` na pasta `.agents/scripts/` que atua como um agente verificador.
