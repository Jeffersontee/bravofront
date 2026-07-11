# Angular SCSS Budget Rules

## O Problema: Maximum Budget Exceeded
No Angular (e Ionic), o arquivo `angular.json` define orçamentos (budgets) de performance rigorosos para o tamanho final dos estilos de cada componente (frequentemente em torno de 2.00 kB a 8.00 kB). Quando o arquivo SCSS cresce muito, o build falha com o erro:
`[ng] X [ERROR] src/app/... exceeded maximum budget. Budget 8.00 kB was not met by XX bytes...`

## Diretrizes de Otimização (Como evitar)

1. **Evite Comentários Longos em SCSS**: Comentários artísticos, divisórias gigantes (ex: `// ==================`) ou notas muito longas dentro de arquivos `.scss` adicionam bytes que o compilador inicialmente precisa processar, e em alguns cenários de inspeção de budget afetam a pesagem direta antes da minificação agressiva. Mantenha os comentários curtos e objetivos.
2. **Reutilize Variáveis**: Evite repetir blocos estáticos longos de cores (`rgba(...)`) ou sombras complexas (`box-shadow: 0 4px ...`). Use as variáveis CSS nativas do Ionic ou declare-as no topo do escopo.
3. **Mova Estilos Comuns para o Global**: Se você criar uma UI muito complexa (ex: tabelas estilizadas, formulários avançados) cujos estilos são aplicáveis em toda a plataforma, mova as classes comuns para o `src/global.scss`. Isso tira o "peso" do escopo do componente isolado e impede que o budget estoure, além de favorecer o cache.
4. **Nesting Inteligente**: O aninhamento (nesting) excessivo no SCSS (mais de 3 níveis profundos) gera seletores concatenados gigantes no CSS final, inflando o arquivo.
5. **Agrupamento (DRY - Don't Repeat Yourself)**: Agrupe seletores que possuem as mesmas regras CSS em vez de escrevê-los separadamente.

## Como Corrigir o Erro Imediatamente
Se o erro for disparado por poucos bytes (como `not met by 37 bytes`):
1. Acesse o `.scss` com erro e delete os comentários grandes.
2. Junte classes irmãs sob a mesma declaração quando possível.
3. Reduza a repetição consolidando regras redundantes.
