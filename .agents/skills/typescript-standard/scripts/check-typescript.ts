import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

console.log(`${YELLOW}Iniciando verificação do Padrão TypeScript (typescript-standard)...${RESET}\n`);

const workspaceRoot = path.resolve(__dirname, '../../../..');
const srcDir = path.join(workspaceRoot, 'src');
const tsconfigPath = path.join(workspaceRoot, 'tsconfig.json');

// 1. Verificar strict mode no tsconfig.json
let hasStrict = false;
if (fs.existsSync(tsconfigPath)) {
  try {
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    // Regex simples para capturar 'strict' ignorando comentários que poderiam quebrar JSON.parse puro
    if (/"strict"\s*:\s*true/.test(tsconfigContent)) {
      hasStrict = true;
      console.log(`${GREEN}✔ tsconfig.json: Modo Strict está ATIVADO.${RESET}`);
    } else {
      console.log(`${RED}✖ tsconfig.json: O 'strict: true' não foi encontrado! A regra de tipagem estrita foi violada.${RESET}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`${RED}✖ Erro ao ler o tsconfig.json: ${message}${RESET}`);
  }
} else {
  console.log(`${YELLOW}⚠ Nenhum tsconfig.json encontrado na raiz: ${workspaceRoot}${RESET}`);
}

// 2. Verificar a presença de arquivos .js / .mjs na pasta src (que deveriam ser TypeScript)
console.log(`\n${YELLOW}Buscando arquivos .js/.mjs não autorizados em 'src'...${RESET}`);
const jsFilesFound: string[] = [];

function findJsFiles(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findJsFiles(fullPath);
    } else {
      if (fullPath.endsWith('.js') || fullPath.endsWith('.mjs')) {
        jsFilesFound.push(fullPath);
      }
    }
  }
}

findJsFiles(srcDir);

if (jsFilesFound.length === 0) {
  console.log(`${GREEN}✔ Nenhum arquivo .js ou .mjs encontrado na pasta src. O projeto está 100% TypeScript.${RESET}`);
} else {
  console.log(`${RED}✖ Foram encontrados ${jsFilesFound.length} arquivos JavaScript em 'src', que deveriam ser refatorados para TypeScript:${RESET}`);
  jsFilesFound.forEach(f => console.log(`  - ${f.replace(workspaceRoot, '')}`));
}

// 3. Opcional: Rodar `npx tsc --noEmit` para reportar falhas graves de TS
console.log(`\n${YELLOW}Rodando validação de sintaxe e tipos via tsc --noEmit (Isto pode levar alguns segundos)...${RESET}`);
try {
  child_process.execSync('npx tsc --noEmit', { cwd: workspaceRoot, stdio: 'inherit' });
  console.log(`\n${GREEN}✔ Compilação TypeScript passou sem erros! O projeto está saudável.${RESET}`);
} catch (err) {
  console.log(`\n${RED}✖ A validação TypeScript encontrou erros. Conserte os erros acima para seguir o padrão da skill.${RESET}`);
}
