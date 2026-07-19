# Padrão TypeScript - Bravo Instalações

Este documento define as diretrizes e melhores práticas para a escrita de código TypeScript no ecossistema (Front e Back).

## 1. Strict Mode
O TypeScript deve ser utilizado em sua capacidade máxima de inferência e validação.
- **`strict: true`**: Deve estar sempre ativo no `tsconfig.json`.
- **`noImplicitAny: true`**: Nunca permita tipagem implícita `any`.
- **`strictNullChecks: true`**: Avalie sempre possíveis valores `null` ou `undefined`. O uso do non-null assertion operator (`!`) deve ser evitado e justificado quando usado.

## 2. Tipagem (Interfaces vs Types)
Embora `interface` e `type` possuam comportamentos parecidos no TS moderno, estabelecemos o seguinte padrão semântico:
- Use **`interface`** para declaração de objetos, DTOs, e modelos de dados (ex: retorno de APIs, payloads, entidades do Mongoose). As interfaces são abertas (declaration merging) e preferidas para tipagem de objetos.
- Use **`type`** para uniões, interseções, tuplas, tipos utilitários ou mapeados (ex: `type ID = string | number;`).

## 3. Banimento do `any`
O uso do tipo `any` silencia o compilador do TypeScript e remove a segurança.
- **Evite o `any` a todo custo.** 
- Se o tipo for desconhecido no momento, use **`unknown`**. Isso forçará o desenvolvedor a fazer *Type Guarding* (validação do tipo em tempo de execução) antes de usar a variável.
- Se for uma biblioteca legada de terceiros que exija `any`, justifique a adoção em um comentário ou isole o uso.
- No frontend (Angular Templates), quando estritamente necessário para burlar um erro de tipagem de união de Mongoose Populado (ex: `string | Entidade`), o uso de `$any(var)` é tolerado nos templates, porém evitado na lógica de negócio do `.ts`.

## 4. Tipagem de Respostas HTTP (API Envelope)
Toda requisição e resposta de API deve ser tipada corretamente seguindo o padrão de Envelope:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```
Não deixe retornos de serviços com `Observable<any>` ou `Promise<any>`.

## 5. Exports Uniformes
- Evite exports defaults (`export default class ...`), prefira *named exports* (`export class ...`) para garantir a consistência do nome em toda a refatoração e importação.

## 6. Preferências Modernas
- **Early Return**: Reduza o aninhamento de `if/else` fazendo retornos precoces.
- **Optional Chaining (`?.`)** e **Nullish Coalescing (`??`)**: Use sempre que precisar acessar propriedades aninhadas em vez de testar a existência do pai `if (pai && pai.filho)`.

## 7. Segurança de Rotas (Guards OBRIGATÓRIOS)
Para garantir que nenhuma rota restrita (Super Admin, Lojista, Colaborador/Técnico, Cliente) fique pública ou exposta a manipulação de URLs no navegador:
- **Rotas de Perfil (Role Isolation)**: Toda rota principal no `app.routes.ts` (exceto `login`, `signup` e a raiz `""`) deve possuir obrigatoriamente um Guard de acesso `canMatch` apontando para o `roleGuard` e especificando o cargo esperado na propriedade `data.role`.
- **Rotas Globais / Comuns**: Rotas comuns a múltiplos perfis que exigem autenticação mínima (ex: `/service-orders`) devem possuir o guard de autenticação `canActivate` apontando para `authGuard`.
- **Isolamento de Tenant**: Páginas internas de lojistas com parâmetros variáveis de ID devem usar o `companyOwnerGuard` no `canActivate` para impedir manipulação maliciosa de parâmetros na barra de endereços.

## 8. Script de Verificação Integrado
Esta skill disponibiliza o script `check-typescript.ts` para varrer o projeto de forma automatizada. Ele executa:
1. Validação de ativação do `strict mode` no `tsconfig.json`.
2. Busca por arquivos `.js` ou `.mjs` não autorizados na pasta `src`.
3. **Auditoria de segurança de rotas principais no `app.routes.ts`**, validando se as rotas possuem guards ativos e bloqueando o build em caso de falha.
4. Validação de compilação sem erros via `npx tsc --noEmit`.
