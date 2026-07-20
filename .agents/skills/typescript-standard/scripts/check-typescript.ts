import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

console.log(`${YELLOW}Iniciando verificação do Padrão TypeScript & Segurança de Rotas (typescript-standard)...${RESET}\n`);

const workspaceRoot = process.cwd();
const srcDir = path.join(workspaceRoot, 'src');
const tsconfigPath = path.join(workspaceRoot, 'tsconfig.json');
const routesFilePath = path.join(srcDir, 'app', 'app.routes.ts');

let hasErrors = false;

// 1. Verificar strict mode no tsconfig.json
let hasStrict = false;
if (fs.existsSync(tsconfigPath)) {
  try {
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    if (/"strict"\s*:\s*true/.test(tsconfigContent)) {
      hasStrict = true;
      console.log(`${GREEN}✔ tsconfig.json: Modo Strict está ATIVADO.${RESET}`);
    } else {
      console.log(`${RED}✖ tsconfig.json: O 'strict: true' não foi encontrado! A regra de tipagem estrita foi violada.${RESET}`);
      hasErrors = true;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`${RED}✖ Erro ao ler o tsconfig.json: ${message}${RESET}`);
    hasErrors = true;
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
  hasErrors = true;
}

// 3. Auditoria de Segurança de Rotas (Evitar rotas sem Guards expostas de forma pública)
console.log(`\n${YELLOW}Iniciando auditoria de segurança das rotas principais em app.routes.ts...${RESET}`);
if (fs.existsSync(routesFilePath)) {
  try {
    const content = fs.readFileSync(routesFilePath, 'utf8');
    const routeBlocks: { fullBlock: string; path: string }[] = [];
    const routeRegex = /^\s{2}\{\s*path:\s*'([^']+)',[\s\S]*?^\s{2}\}/gm;
    let match;

    while ((match = routeRegex.exec(content)) !== null) {
      routeBlocks.push({
        fullBlock: match[0],
        path: match[1]
      });
    }

    const publicPaths = ['', 'login', 'signup'];

    routeBlocks.forEach(route => {
      const isPublic = publicPaths.includes(route.path);
      const hasGuard = route.fullBlock.includes('canMatch') || route.fullBlock.includes('canActivate');

      if (!isPublic && !hasGuard) {
        console.error(`${RED}🚨 [VULNERABILIDADE]: A rota '/${route.path}' não possui nenhum Guard associado (canMatch ou canActivate)!${RESET}`);
        hasErrors = true;
      } else {
        console.log(`${GREEN}✔ [OK]: Rota '/${route.path}' protegida ou pública autorizada.${RESET}`);
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`${RED}✖ Erro ao auditar app.routes.ts: ${message}${RESET}`);
    hasErrors = true;
  }
} else {
  console.log(`${YELLOW}⚠ Nenhum arquivo app.routes.ts encontrado em: ${routesFilePath}${RESET}`);
}

if (hasErrors) {
  console.error(`\n${RED}✖ [FALHA]: A verificação encontrou inconformidades de padrões ou segurança! Conserte-as antes de prosseguir.${RESET}`);
  process.exit(1);
}

// 4. Rodar `npx tsc --noEmit` para reportar falhas graves de TS
console.log(`\n${YELLOW}Rodando validação de sintaxe e tipos via tsc --noEmit (Isto pode levar alguns segundos)...${RESET}`);
try {
  child_process.execSync('npx tsc --noEmit', { cwd: workspaceRoot, stdio: 'inherit' });
  console.log(`\n${GREEN}✔ Compilação TypeScript passou sem erros! O projeto está saudável.${RESET}`);
  process.exit(0);
} catch (err) {
  console.log(`\n${RED}✖ A validação TypeScript encontrou erros. Conserte os erros acima para seguir o padrão da skill.${RESET}`);
  process.exit(1);
}
