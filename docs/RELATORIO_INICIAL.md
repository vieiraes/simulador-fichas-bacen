# Relatório Inicial - Simulador de Fichas DICT (Bacen)

## 1. Visão Geral do Projeto

O **Simulador de Controle de Fichas DICT** é uma aplicação projetada para emular as regras de limitação de consultas e transações Pix impostas pelo Banco Central do Brasil (Bacen). Ele não realiza transações reais, mas implementa a lógica do "algoritmo de token bucket" (balde de fichas) para simular o limite de requisições de clientes (CNPJs) e de uma instituição financeira geral (ISPB).

## 2. Arquitetura da Solução

O sistema é dividido em três componentes principais, todos construídos com TypeScript e JavaScript:

1.  **Backend (API Restful):** 
    Desenvolvido em Node.js com o framework **Express**. Responsável por armazenar o estado em memória dos saldos de cada "balde" (cliente e ISPB) e fornecer rotas que descontam essas fichas em cenários de transações de sucesso/falha e consultas de sucesso/falha. 
    
2.  **Worker de Recarga:**
    Um processo assíncrono isolado usando a biblioteca `cron`, executado em segundo plano. Ele simula o próprio Bacen recarregando os baldes dos participantes de acordo com um intervalo de tempo predefinido no arquivo `.env`. Esse worker realiza uma chamada à rota `/pix/balde/recarga`.

3.  **BFF (Backend for Frontend) e Frontend:**
    - **BFF:** O backend também hospeda rotas separadas sob o prefixo `/bff`, cujo objetivo é padronizar e formatar o retorno das chamadas da API principal para consumo amigável da interface.
    - **Frontend Web:** Uma aplicação **React** empacotada com **Vite** e estilizada com **Bootstrap**. Fornece um painel de controle (Dashboard) moderno e responsivo que exibe em tempo real o esvaziamento e o preenchimento dos baldes de cada cliente e do ISPB, incluindo gráficos e formulários interativos.

## 3. Estrutura de Diretórios e Arquivos-Chave

-   `src/server.ts`: Ponto de entrada do backend. Ele instancia o servidor Express, registra as rotas da API principal e do BFF, e configura o serviço dos arquivos estáticos compilados do frontend.
-   `src/cron.ts`: Ponto de entrada do worker que orquestra os agendamentos (`cron`) para chamar o endpoint de recarga em loop.
-   `src/api/`: Contém a lógica de negócio do simulador.
    -   `src/api/models/wallets.model.ts`: Armazena o estado mockado do sistema, mantendo os IDs de três clientes fictícios e a entidade do ISPB principal, definindo o volume de seus baldes conforme o `.env`.
    -   `src/api/controllers/`: Detém os algoritmos de desconto de fichas consoante o tipo da requisição, validando se existe saldo antes de permitir uma transação de "Sucesso" ou de "Falha".
-   `src/bff/`: Contém controladores e rotas que servem como intermediários, facilitando o consumo pelas telas do Front.
-   `src/frontend/`: Contém a base de código do SPA em React.

## 4. Tecnologias Utilizadas

-   **Backend:** Node.js, Express.js, TypeScript, Cron, Axios.
-   **Frontend:** React (v19), Vite, React-Bootstrap, React-Router-DOM.
-   **Gerenciamento de Ambiente:** `.env` (dotenv).
-   **Orquestração de Desenvolvimento:** Nodemon e Concurrently (para executar Worker + Servidor simultaneamente com `npm start`).

## 5. Como o Simulador Funciona na Prática

1.  A aplicação sobe e lê os tamanhos dos baldes (ISPB e Clientes) pelo `.env`.
2.  Através do frontend ou Postman, o usuário dispara eventos como "Chave Sucesso", "Pix Falha", etc.
3.  A API recebe as chamadas, avalia o saldo no objeto `wallets.model.ts`. Se houver "fichas", o valor é subtraído e a operação simula o evento (Ex: retorna 200). Se os recursos acabarem, a API recusa a simulação.
4.  Em paralelo, o Worker (`cron.ts`) continuará fazendo "ping" de tempos em tempos (ex: a cada 2 segundos) para restaurar os saldos de volta ao teto permitido.

## Conclusão

Trata-se de um software full-stack bastante completo para demonstração técnica e estresse das lógicas de rate-limiting baseadas nos moldes do mercado financeiro e do PIX. É ideal como base educacional para entender problemas de "thundering herd" e filas, assim como comportamentos de *circuit breaker*.
