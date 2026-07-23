# Skill: Modernização e Melhores Práticas (Angular & Ionic)

Esta skill define as diretrizes para modernização de código legado nos ecossistemas Angular e Ionic, garantindo performance e legibilidade técnica com base nos padrões estáveis vigentes.

## Contexto e Ativação
Acione as diretrizes desta skill sempre que o usuário fornecer trechos de código contendo:
* Templates HTML de componentes Angular.
* Arquivos TypeScript (`.ts`) contendo componentes, diretivas, pipes ou serviços.
* Arquivos de estilização global ou local (`.scss`, `.css`).

## Referências Técnicas Mapeadas
Consulte os arquivos locais na pasta `references/` para aplicar as regras específicas de cada escopo:

* **Templates e Renderização:** `.agents/skills/angular-ionic-modern/references/control-flow.md`
* **Lógica, Estado e Injeção:** `.agents/skills/angular-ionic-modern/references/reactivity.md`
* **Estilização e Shadow DOM:** `.agents/skills/angular-ionic-modern/references/ionic-styling.md`

## Alinhamento com Outras Skills
* **@angular-strict-separation:** Ao propor refatorações de código moderno baseadas em Signals ou Injeção Funcional, certifique-se de manter a separação estrita de responsabilidades entre a camada de apresentação (Componentes) e a camada de negócios (Serviços).
