# Simulador de Consumo de Fichas do de Balde do BACEN

Este projeto é um simulador de consumo de fichas no balde do BACEN (Banco Central do Brasil) desenvolvido em Node.js e Express. Ele simula operações relacionadas ao Pix, incluindo adição de fichas, verificação de saldo e execução de transações de sucesso e falha.

## Descrição do Projeto

O simulador consiste em três arquivos principais: `pix.controller.ts`, `cron.ts` e `server.ts`. Cada um desempenha um papel específico na simulação das operações do Pix.

### Arquivo `pix.controller.ts`

O `pix.controller.ts` contém as rotas e controladores que permitem a manipulação das operações de Pix.

#### Rotas

1. **POST /balde**
   - Esta rota permite adicionar fichas a uma carteira.
   - Parâmetros de consulta: `wallet` (ID da carteira)
   - Respostas:
     - Status 201: Fichas adicionadas com sucesso.
     - Status 200: Limite de fichas atingido.
     - Status 404: Carteira não encontrada.

2. **GET /balde**
   - Esta rota permite verificar o saldo de todas as carteiras.
   - Resposta:
     - Status 200: Retorna o saldo de todas as carteiras.

3. **POST /success**
   - Esta rota simula uma transação de sucesso.
   - Parâmetros de consulta: `wallet` (ID da carteira)
   - Respostas:
     - Status 400: Pix não permitido devido a saldo insuficiente.
     - Status 201: Pix efetuado com sucesso.

4. **POST /fail**
   - Esta rota simula uma transação com falha.
   - Parâmetros de consulta: `wallet` (ID da carteira)
   - Respostas:
     - Status 400: Pix não permitido devido a saldo insuficiente.
     - Status 400: Pix não efetuado devido a falha na consulta de chave.
     - Status 404: Carteira não encontrada.

### Arquivo `cron.ts`

O `cron.ts` contém uma tarefa cron que atualiza automaticamente o saldo das carteiras.

- A tarefa cron envia uma solicitação POST para a rota `/pix/balde` a cada 2 segundos, recarregando em 2 fichas o saldo das carteiras até o seu limite preestabilecido no aqruivo .ENV. geralmente é de 1000 fichas.

### Arquivo `server.ts`

O `server.ts` inicializa o servidor Express e configura as rotas relacionadas ao Pix.

- Inicializa um servidor Express na porta 3000.
- Configura o uso de JSON no aplicativo Express.
- Configura as rotas relacionadas ao Pix com base no `PixController`.
- Inicializa o servidor e exibe uma mensagem de sucesso ou falha.

## Executando o Projeto

Para executar o projeto, siga estas etapas:

1. Certifique-se de ter o Node.js instalado em sua máquina.
2. Abra um terminal na pasta raiz do projeto.
3. Execute `npm install` para instalar as dependências.
4. Execute `npm start` para iniciar o servidor Express.

Certifique-se de ajustar e expandir o projeto conforme necessário para atender aos requisitos específicos do seu caso de uso.

Este simulador é um exemplo simples de como as operações Pix podem ser modeladas em uma aplicação Node.js. Use-o como base para desenvolver e testar funcionalidades relacionadas ao Pix ou como uma ferramenta de simulação para entender o comportamento das operações de fichas no balde do BACEN.
