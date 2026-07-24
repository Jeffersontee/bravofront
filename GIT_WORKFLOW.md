# 🚀 O Ciclo de Vida do seu Código - Dia a Dia

Este guia documenta o fluxo de trabalho (Git Flow) e o pipeline de integração/entrega contínua (CI/CD) para manter e publicar o ecossistema da **Bravo Instalações** (tanto o **Backend** no Heroku quanto o **Frontend** no Firebase e Android).

---

## 📌 Visão Geral do Fluxo

```
💻 Desenvolvedor
  │
  ├── 🌿 Cria Branch: feat-sua-feature
  │
  ├── 🧪 Merge em: staging (Homologação)
  │    └── ⚙️ Esteira Automática:
  │         ├── 📦 Backend ──> Heroku Staging
  │         ├── 🌐 Frontend ─> Firebase Staging
  │         └── 🤖 Android ──> bravo-instalacoes-staging.apk
  │
  └── 🚀 Merge em: main (Produção)
       └── ⚙️ Esteira Automática:
            ├── 📦 Backend ──> Heroku Produção
            ├── 🌐 Frontend ─> Firebase Produção
            └── 🤖 Android ──> bravo-instalacoes-prod-unsigned.apk
```

---

## 💻 1. O Dia a Dia: Criando uma Nova Feature

Todo novo desenvolvimento de funcionalidade, ajuste ou correção deve ocorrer em uma ramificação (branch) própria baseada na `main`.

> [!TIP]
> **Boas Práticas de Commit:** Use prefixos semânticos para seus commits (ex: `feat:` para novas features, `fix:` para correções, `docs:` para documentação).

```bash
# 1. Garanta que você está na branch principal e atualizado
git checkout main
git pull origin main

# 2. Crie e mude para a sua nova branch temporária
git checkout -b feat-nome-da-sua-feature

# 3. Codifique as alterações e salve o progresso
git status                          # Vê os arquivos alterados
git add .                           # Adiciona todos os arquivos
git commit -m "feat: adicionar controle de versao no app" # Cria o commit

# 4. Publique a sua branch no GitHub pela primeira vez
git push -u origin feat-nome-da-sua-feature
```

---

## 🧪 2. Homologação: Publicando em Staging (Ambiente de Testes)

Quando a sua feature estiver concluída, envie as alterações para a branch `staging`. A esteira irá compilar o código do backend e do frontend de forma isolada nos servidores de testes.

```bash
# 1. Vá para a branch staging e atualize-a com o servidor
git checkout staging
git pull origin staging

# 2. Mescle as alterações da sua feature dentro da staging
git merge feat-nome-da-sua-feature

# 3. Envie para o GitHub para disparar os deploys automáticos
git push origin staging

# 4. Volte para a sua branch para continuar desenvolvendo
git checkout feat-nome-da-sua-feature
```

### ⚙️ O que a esteira executa automaticamente em Staging:

*   **Backend (Heroku):**
    *   Roda os testes automatizados da aplicação.
    *   Realiza o build do projeto.
    *   Faz o deploy automático no servidor do **Heroku Staging**.
*   **Frontend (Firebase & Android):**
    *   Roda o build apontando para `environment.staging.ts`.
    *   Publica o site no **Firebase Hosting (Staging)**.
    *   Sincroniza os plug-ins do Capacitor com a pasta do Android.
    *   Compila a APK usando o Gradle e publica o arquivo **`bravo-instalacoes-staging.apk`** para instalação imediata de testes diretamente na aba **Actions** do GitHub.

---

## 🏆 3. Produção: Publicando a Versão Oficial (Live)

Após as validações e testes concluídos com sucesso em Staging, as alterações estão prontas para ir ao ar para os clientes e técnicos reais.

```bash
# 1. Vá para a branch principal main e atualize-a
git checkout main
git pull origin main

# 2. Mescle a sua branch aprovada dentro da main
git merge feat-nome-da-sua-feature

# 3. Envie para o GitHub para disparar os deploys automáticos oficiais
git push origin main
```

### ⚙️ O que a esteira executa automaticamente em Produção:

*   **Backend (Heroku):**
    *   Valida a integridade do código através dos testes automatizados.
    *   Compila o projeto.
    *   Atualiza o servidor do **Heroku Produção (Live)**.
*   **Frontend (Firebase & Android):**
    *   Roda o build otimizado apontando para `environment.prod.ts`.
    *   Publica a nova versão do site no **Firebase Hosting Oficial (Live)**.
    *   Sincroniza os plug-ins do Capacitor com a pasta do Android.
    *   Gera e empacota a APK de Produção (`assembleRelease`), disponibilizando o arquivo **`bravo-instalacoes-prod-unsigned.apk`** para download oficial na aba **Actions** do GitHub.

---

## 🛠️ 4. Caixa de Ferramentas: Comandos Úteis

> [!IMPORTANT]
> Nunca faça commits diretamente na branch `main` ou `staging`. Mantenha a integridade da árvore mantendo as branches separadas.

*   **Verificar modificações atuais:**
    ```bash
    git status
    ```
*   **Comparar diferenças antes do commit:**
    ```bash
    git diff
    ```
*   **Descartar alterações locais não salvas em um arquivo:**
    ```bash
    git restore caminho/do/arquivo.ts
    ```
*   **Visualizar o histórico recente de modificações:**
    ```bash
    git log --oneline -n 10
    ```
*   **Atualizar todas as ramificações conhecidas do servidor:**
    ```bash
    git fetch --all
    ```
