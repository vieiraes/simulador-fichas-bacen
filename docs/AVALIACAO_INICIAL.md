# Avaliação do projeto como peça de portfólio (QA)

Data: 11/10/2026. Commit avaliado: `e33f6c8` (branch `main`, em dia com `origin/main`).
Ambiente: Node 24.19.0, npm 11.17.0, Linux.

## 1. O que o produto é hoje

O nome do repositório no GitHub ("API de Simulador de Consumo de Fichas...") e os topics (`api`) contam uma história que não existe mais. O commit `e33f6c8` (31/05/2026, "refactor: streamline project architecture...") apagou 10.698 linhas: o backend Express (`src/server.ts`, `src/api/*`, `src/bff/*`), o worker `src/cron.ts`, os Dockerfiles, o `docker-compose-k6.yml`, os scripts K6 (`runner-balde-success.js` e `runner-balde-fail.js`), a `postman_collection.json` e os specs do Spec Kit.

Hoje o projeto é **uma SPA React 19 + Vite 7 + React-Bootstrap, sem nenhuma API**. Toda a regra está em `src/frontend/context/SimulationContext.tsx`, com o estado no `useState` do navegador:

- 3 wallets "cliente" com balde de 100 fichas e 1 ISPB (`03311443`) com balde de 300;
- 4 operações: PIX sucesso, PIX falha, consulta de chave com sucesso e consulta de chave com falha;
- a recarga roda a cada 2 s, com +2 fichas por balde até o teto (`SimulationContext.tsx:52-68`), e há também um botão de recarga manual.

Regra implementada no código:

| Operação | Pré-condição | Cliente | ISPB | Resultado |
|---|---|---|---|---|
| PIX sucesso | cliente ≥ 21 e ISPB ≥ 3 | −1 | −1 | sucesso |
| PIX falha ("chave inválida") | cliente ≥ 21 e ISPB ≥ 3 | −20 | −3 | erro "429" |
| Consulta chave sucesso | cliente ≥ 21 e ISPB ≥ 1 | −1 | −1 | sucesso |
| Consulta chave falha | cliente ≥ 21 e ISPB ≥ 1 | −20 | −3 | erro "429" |
| Bloqueio | abaixo da pré-condição | 0 | 0 | erro "400" |

## 2. A regra bate com o DICT/Bacen?

Fontes: a API do DICT (políticas `ENTRIES_READ_USER_ANTISCAN`, `_V2` e `ENTRIES_READ_PARTICIPANT_ANTISCAN`, reproduzidas na doc da OpenPix), o changelog oficial da API DICT no bcb.gov.br (v1.8.0, 2022) e a central de ajuda da Celcoin. O texto atual do Manual Operacional do DICT não foi encontrado aberto no site do BCB. Por isso, os números abaixo devem ser confirmados na versão vigente.

Regra de referência:
- **Balde do usuário final (pagador, por CPF/CNPJ):** PF tem 100 fichas e repõe 2/min; PJ tem 1.000 fichas e repõe 20/min. Consulta com 200 subtrai 1; consulta com 404 subtrai 20. Uma **ordem de pagamento enviada devolve** fichas: +1 para PF, +2 para PJ. Os baldes são separados por tipo de chave: EMAIL/PHONE ficam em um, CPF/CNPJ/EVP no outro (V2).
- **Balde do participante (ISPB):** consulta com 200 subtrai 1; consulta com 404 subtrai 3; ordem de pagamento enviada devolve +1. O tamanho e a reposição dependem da categoria do participante (A a H). Pelo changelog, as categorias A e B repõem 12.000/min e 8.000/min.
- Com o balde vazio, o DICT responde **HTTP 429**.

O que bate:
- O custo da consulta com sucesso (−1 / −1) e da consulta sem sucesso (−20 / −3) está correto.
- O modelo de dois baldes independentes (usuário final e participante) e o 100 como tamanho do balde PF também estão corretos.

Divergências:
1. **O Pix gasta fichas, mas deveria devolver.** No DICT, o pagamento não gasta ficha; ele *repõe* a ficha da consulta que o originou (mesmo `endToEndId`). O "PIX sucesso" do simulador subtrai 1 de cada balde (`SimulationContext.tsx:88-89`). O backend antigo tinha o comportamento oposto: subtraía e somava de volta, ou seja, efeito líquido zero. O comentário em `SimulationContext.tsx:91-94` tratou isso como bug e "corrigiu" para o lado errado.
2. **"PIX falha" é, na verdade, uma consulta 404 duplicada.** O efeito é idêntico ao de "Consulta chave falha" (−20 / −3). No DICT, o erro de chave acontece na consulta, não no Pix.
3. **O rótulo é CNPJ, mas o tamanho é de PF.** O balde do cliente é chamado de "CNPJ" nas mensagens de erro (`SimulationContext.tsx:82,108,125,146`), mas tem 100 fichas. Para PJ, o certo seria 1.000 fichas com reposição de 20/min. O simulador não tem PF/PJ.
4. **A reposição está muito acima da real.** São +2 a cada 2 s, ou seja, 60/min, igual para todos os baldes (`SimulationContext.tsx:55,62,67`). O real é 2/min (PF), 20/min (PJ) ou o valor da categoria do participante.
5. **O balde do ISPB é pequeno e fixo:** 300 fichas, sem categorias A–H.
6. **O limiar de bloqueio está errado.** O simulador bloqueia qualquer operação com o cliente abaixo de 21 fichas, inclusive a consulta que custaria 1 (`:81,107,124,145`). O DICT só recusa com o balde vazio.
7. **Os status HTTP estão invertidos.** O bloqueio por falta de ficha devolve "400", mas o correto é 429. A chave inexistente devolve "429", mas o correto é 404 (`:82,117,125,155`).
8. **Faltam a separação dos baldes por tipo de chave** (ANTISCAN vs ANTISCAN_V2) **e a devolução de ficha por `endToEndId`.**

## 3. Execução local

### Gerenciador de pacotes: npm (`package-lock.json`)
- O README manda usar `npm install`, e o `package-lock.json` é v3 e está sincronizado com o `package.json`.
- O `yarn.lock` é resto do passado. Rodar `npm ci` com npm 11 **reescreve o `yarn.lock`** (remove 225 linhas de binários do esbuild por plataforma). Revertei a alteração com `git checkout -- yarn.lock`. Manter os dois lockfiles gera ruído no diff.
- O `.env` **não é necessário**. Nenhuma variável do `.env.example` é lida pelo código (ISPB, BALDE_*, PORT, URL, CRON). Não criei `.env`.

### Comandos
```bash
npm ci                 # 13 vulnerabilidades no npm audit (1 crítica, 10 altas), todas com fix disponível
npm run dev            # Vite em http://localhost:3001
npm run build          # gera frontend-build/ (~2 s, sem erros)
npx tsc --noEmit -p .  # 0 erros de tipo
```

### Resultado do teste manual automatizado (Playwright, Chromium, 1366×900)
Sequência: Cliente 1, depois PIX sucesso, 4× PIX falha e por fim consulta com sucesso.
- Os números da tela seguem o código: 100→99, 79, 59, 41*, 21, 20. *A recarga de 2 s entrou no meio.
- O ISPB foi 300→299→296→…→288.
- Com 20 fichas, o "Status Geral" fica "Limitado". Quatro segundos depois, a recarga levou o cliente a 24.
- **Console: 0 erros, 0 warnings e nenhuma resposta HTTP ≥ 400.**
- **Botão "Postman":** o download foi cancelado. Ele aponta para `/bff/postman-collection` (`Dashboard.tsx:30`), um endpoint que não existe mais. No Firebase, por causa do rewrite `** → /index.html`, o usuário baixaria o HTML da SPA renomeado como `.json`.
- **Mobile (390 px):** `scrollWidth` = 454, ou seja, há rolagem horizontal.

Screenshots (fora do repo): `/tmp/claude-1000/-home-bruno-vieira-projects-gh-bruno-bingo-distribuido/4b7d1f44-b83d-431b-bcfb-439e02277dbe/scratchpad/simulador/01-dashboard.png` e `02-simulacao-bloqueio.png`.

## 4. Problemas encontrados (arquivo:linha)

**Funcionais / regra**
- `src/frontend/pages/Dashboard.tsx:239,248,257,266`: os textos do accordion contradizem o código. Dizem que o "PIX sucesso consome 10 fichas do cliente" (consome 1), que o "PIX falha não consome do cliente" (consome 20) e que a consulta "não cobra do ISPB" (cobra 1 ou 3). O print `02` mostra o texto "ISPB não é cobrado" com o ISPB caindo de 289 para 288.
- `README.MD:39-42`: repete as mesmas regras erradas da tela.
- `SimulationContext.tsx:127-128,148-153`: "Consulta chave falha" verifica `ispb.balde < 1` mas subtrai 3. **Com o ISPB em 1 ou 2, o balde fica negativo.**
- `SimulationContext.tsx:78-89` e os outros handlers: a validação lê o `clients` do closure, mas a subtração é funcional. Duas chamadas no mesmo tick passam pela checagem com o mesmo saldo e podem deixar o balde negativo. Hoje isso é difícil de acontecer por clique, mas aparece num teste unitário.
- `SimulationContext.tsx:72-73`: o retorno de `recargaBuckets` devolve o estado antigo (o próprio comentário admite).
- `Dashboard.tsx:147-187`: o card "Status dos Buckets" mostra sempre o `clients[0]`, qualquer que seja a wallet selecionada. Os divisores 100 e 300 estão fixos no código (`:153,169,171`).
- `Dashboard.tsx:24-26,80-85`: o botão "Atualizar" não faz nada (handler vazio).
- `Dashboard.tsx:28-35`: botão "Postman" quebrado (ver acima).
- `Dashboard.tsx:226`: a cor do alerta é decidida por `message.includes('sucesso'|'encontrada')`, ou seja, por casamento de string.

**Documentação e configuração desatualizadas (sobras da arquitetura antiga)**
- `check-status.sh` (inteiro): procura `dist/server.js` e a porta 3000 e faz curl em `/bff/dashboard`. Nada disso existe mais, então ele sempre reporta ❌.
- `docs/COMO_EXECUTAR.md`, `docs/DOCUMENTACAO_ARQUITETURA.md` e `docs/RELATORIO_INICIAL.md`: descrevem Express, BFF, worker, `start-all.sh` e scripts `npm run build:frontend/worker/server`, que não existem.
- `.env.example`: nenhuma variável é usada. Os valores estão fixos em `SimulationContext.tsx:3-4,43`.
- `vite.config.ts:22-26`: proxy de `/api` e `/bff` para `:3000`, que não existe mais.
- `.github/agents/copilot-instructions.md`: orienta `npm test && npm run lint`, scripts que não existem. Além disso, o arquivo está numa pasta fora do padrão (o Copilot lê `.github/copilot-instructions.md`).
- `README.MD:60`: diz "pasta `dist` (ou `frontend-build`)", mas a pasta é só `frontend-build`.
- `utils/utils.js`: helper dos scripts K6, que foram removidos (arquivo órfão). `utils/example-screen.png` existe, mas o README não exibe nenhuma imagem.
- `package.json`: `axios`, `dotenv` e `@types/node` estão em `dependencies` sem uso. `@types/typescript` é um pacote obsoleto. Não há scripts `test` nem `lint`.
- `tsconfig.json`: `strictNullChecks: false` e `module: CommonJS` num projeto Vite/ESM.
- **Descrição e topics do GitHub** ("API", topic `api`) não batem com o projeto atual.

## 5. Testes

**Não existe nenhum teste.** Não há `*.test.*`, `*.spec.*`, Vitest/Jest, Playwright nem script `test`. Os únicos artefatos de teste que existiam eram os scripts K6 (carga contra a API Express), e eles foram removidos junto com o backend no `e33f6c8`. Cobertura: 0%. Também não há CI: `actions/workflows` = 0.

O que faltaria para virar vitrine de QA:
1. **Extrair a regra para uma função pura**, por exemplo `src/domain/bucket.ts` com `consume(bucket, event)` e `refill(bucket, elapsedMs)`, sem React. É isso que torna a regra testável.
2. **Testes unitários (Vitest)** com tabela de decisão e análise de valor-limite (0, 1, 2, 3, 20, 21, teto), cobrindo os casos de balde vazio → 429, devolução por pagamento, nunca ficar negativo, teto de recarga e PF vs PJ. Meta de cobertura ≥ 90% no domínio, com relatório publicado.
3. **E2E com Playwright** (Page Object): esgotar o balde, ver o 429, esperar a reposição (com `page.clock` para controlar o tempo), validar o texto da tela contra a regra, verificar a ausência de erros de console, viewport mobile e um check de acessibilidade com axe.
4. **CI no GitHub Actions**: `npm ci`, `tsc`, lint, Vitest com cobertura, build, Playwright (subindo o report como artefato) e deploy de preview. Badges de build, coverage e licença no README.
5. **Deploy público e README de vitrine**: link ao vivo, GIF ou prints, a tabela da regra com as fontes do Bacen, uma seção "Estratégia de testes" (pirâmide, técnicas usadas, como rodar) e uma seção "Bugs que os testes encontraram", que é a parte que mais vende o perfil de QA.

Extra, de valor alto para QA de pagamentos: recuperar o teste de carga K6 contra uma API mínima (a regra extraída exposta por um endpoint serverless), com thresholds e o relatório no README.

## 6. Publicação

- `firebase.json` existe (hosting de `frontend-build`, com rewrite de SPA), mas **não há `.firebaserc`**, então nenhum projeto Firebase está vinculado. Os domínios padrão `simulador-fichas-bacen.web.app`, `.firebaseapp.com` e `simulador-balde-bacen.web.app` devolvem **404 "Site Not Found"**.
- O GitHub mostra um ambiente de deployment `simulador-fichas-bacen` (o último é de 02/09/2025) apontando para o Heroku em `https://simulador-fichas-bacen-145450e84595.herokuapp.com/`. Hoje esse endereço devolve **HTTP 503 "Application Error"**, ou seja, está fora do ar. Ele também é da arquitetura antiga e não reflete o código atual.
- O repositório não tem homepage configurada. GitHub Pages: 404.
- **Conclusão: o projeto não está publicado em nenhum lugar acessível hoje.**

## 7. As 5 melhorias de maior impacto para portfólio de QA

1. **Corrigir a regra para o modelo real do DICT**, com a regra isolada numa função pura e citando a fonte: PF/PJ, 200 → −1, 404 → −20/−3, pagamento devolve ficha, 429 com o balde vazio, reposição por minuto (com um seletor de velocidade de simulação). Alinhar a tela e o README a ela. Hoje a tela contradiz o próprio código, e um recrutador técnico percebe isso.
2. **Suíte Vitest da regra** com valor-limite e tabela de decisão, cobertura publicada e os bugs reais encontrados (ISPB negativo, corrida no closure) virando casos de regressão.
3. **E2E com Playwright** (POM, `page.clock`, console limpo, mobile, axe) e report HTML publicado.
4. **Pipeline no GitHub Actions** (typecheck, lint, unit, e2e, build, deploy) com badges, além de higiene do repo: um lockfile só (npm), remover `yarn.lock`, `check-status.sh`, docs e configs obsoletos e dependências sem uso, e rodar `npm audit fix`.
5. **Deploy público** (Firebase com `.firebaserc`, ou GitHub Pages/Vercel) e **README de vitrine**: link ao vivo, GIF, a regra com fontes, a estratégia de testes e os bugs encontrados. Atualizar também a descrição e os topics do GitHub, que hoje dizem "API".

## Fontes
- [Changelog da API DICT, BCB](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/changelog.html)
- [DICT API: limitação de requisições (OpenPix, espelho da spec)](https://developers.openpix.com.br/en/dict)
- [Existe limite de consultas DICT? (Celcoin)](https://suporte.celcoin.com.br/hc/pt-br/articles/11335506531227-Existe-limite-de-consultas-DICT)
- [Manual Operacional do DICT v7.3 (cópia no Scribd)](https://pt.scribd.com/document/804988659/Manual-Operacionaldo-DICT)
