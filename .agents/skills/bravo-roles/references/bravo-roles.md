# Bravo Instalações — Arquitetura de Papéis e Acessos (Roles & Permissions)

Este documento define a arquitetura central de usuários do sistema Bravo Instalações. O sistema utiliza uma única tabela/coleção `User`, diferenciando as permissões e as visões através do campo `type`.

## 1. Estrutura Central (Single Table Design)
Todos os usuários do sistema residem na mesma estrutura de banco de dados (tabela/coleção `User`). A diferenciação de quem é quem (e do que cada um pode ver) é definida pela propriedade `type`.

## 2. Perfis de Usuário (Tipos)

### 2.1. Cliente Pessoa Física (`user`)
- **Origem:** Cadastra-se diretamente pelo aplicativo (Tela de Signup).
- **Visão Principal:** Aplicativo mobile/web focado no cliente (Customer App).
- **Responsabilidades:** 
  - Visualizar cards de serviços disponíveis.
  - Solicitar/contratar serviços de instalação.
  - Acompanhar o status dos próprios pedidos.

### 2.2. Cliente Lojista / Empresa (`company_owner`)
- **Origem:** Cadastra-se diretamente pelo aplicativo (Signup como Empresa/CNPJ).
- **Visão Principal:** Painel de Administração da Empresa (`company-layout`).
- **Responsabilidades:**
  - Contrata e acompanha os serviços de instalação para a sua loja/estabelecimento.
  - Possui autoridade máxima dentro do seu escopo empresarial (Tenant).
  - Visualiza dashboards de andamento e ordens de serviços restritos à sua própria empresa.

### 2.3. Colaborador / Executor (`collaborator`)
- **Origem:** Criado **exclusivamente** pelo Super Admin. A criação reaproveita o formulário unificado de usuários (`account-form`), não necessitando de um módulo isolado.
- **Visão Principal:** App do Técnico / Painel de Execução.
- **Responsabilidades:**
  - O profissional de campo que efetivamente realiza as instalações.
  - Recebe e gerencia suas Ordens de Serviço (`service-orders`).
  - Atualiza o status do serviço (Iniciado, Concluído, Relatório de Visita).

### 2.4. Super Admin (`super_admin`)
- **Origem:** O usuário "root" (Nasce com a aplicação via Seeds de Banco de Dados).
- **Visão Principal:** Painel Global (`super-layout`).
- **Responsabilidades:**
  - **Catálogo (`/super/services`):** Responsável exclusivo por criar os "Serviços" globais oferecidos pela Bravo. O módulo de serviços vive aqui.
  - **RH Técnico:** Cria as contas dos Colaboradores (`collaborator`) que executarão o trabalho de campo.
  - **Acesso Global:** Pode gerenciar usuários, visualizar todos os painéis, empresas, andamento de todos os serviços globais, com acesso irrestrito a gráficos (Charts) e KPIs.

## 3. Impacto no Desenvolvimento (Front-end e Back-end)

1. **Roteamento e Guards:** 
   O front-end deve usar `AuthGuards` que leiam a propriedade `type` no JWT Token para impedir que um `user` acesse o `/super-admin`, ou que um `company_owner` tente acessar dados de outra empresa (Isolamento de Tenant).
   
2. **Separação de Responsabilidades (Menus e Pastas):** 
   - Cadastros core (como "Criar Serviços", "Criar Colaboradores" e "Criar Usuários") pertencem exclusivamente ao `super-layout`. 
   - O `company-layout` do Lojista foca exclusivamente no acompanhamento das suas próprias requisições.
   - **Ordens de Serviço (`/service-orders`):** É a entidade central global. Clientes visualizam as suas, Colaboradores executam as atribuídas a eles, e o Super Admin monitora todas.

3. **Backend Multi-Tenant:**
   Qualquer consulta (GET, POST) feita por um `company_owner` deve, obrigatoriamente, ser filtrada pelo `company_id` vinculado à sessão do usuário (Tenant Isolation). Já o `super_admin` possui a flag de acesso global (bypass de tenant).
