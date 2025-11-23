# API Simulador de Controle de Fichas DICT

Esta API foi desenvolvida exclusivamente para simular cenários de transações e consultas no DICT (Diretório de Identificadores de Contas Transacionais). Não realiza transações ou consultas reais, mas simula o comportamento das regras de limitação de consultas.

## 🚀 Quick Start

**Para executar o projeto completo:**

```bash
./start-all.sh
```

Ou veja o guia completo em [COMO_EXECUTAR.md](./COMO_EXECUTAR.md)

**Para verificar se está funcionando:**

```bash
./check-status.sh
```

## Interface Web (Frontend)

A aplicação agora inclui uma interface web moderna e responsiva desenvolvida com React e Bootstrap. Para acessar o frontend, inicie o servidor e acesse `http://localhost:3000` no seu navegador.

### Funcionalidades do Frontend:
- **Dashboard com visualização dos saldos dos baldes**
  - Exibição em tempo real dos saldos de clientes e ISPB
  - Gráficos de progresso dos baldes
  - Indicadores visuais de status operacional
- **Download da Postman Collection** 🆕
  - Botão com ícone para download da collection completa
  - Arquivo pronto para importar no Postman
  - Todas as rotas da API documentadas e prontas para teste
- **Botão de Atualizar (Refresh)** 🆕
  - Atualiza os dados do dashboard sem recarregar a página
  - Indicadores visuais de carregamento (spinner + texto)
  - Tratamento silencioso de erros (logs no console)
  - Tempo de resposta < 2 segundos
- **Formulários para simular transações PIX** (sucesso e falha)
- **Formulários para simular consultas de chaves** (sucesso e falha)
- **Recarga automática dos baldes** via worker em background

## Rotas da API

### `/balde/saldos`

- **Método**: GET
- **Descrição**: Retorna os saldos dos baldes dos clientes e do ISPB.
- **Exemplo**:
  ```http
  GET /balde/saldos
  ```

### `/chave/sucesso`

- **Método**: GET
- **Descrição**: Simula uma consulta de chave bem-sucedida, desde que os saldos dos baldes permitam.
- **Parâmetros**: walletId (ID da wallet que realiza a consulta)
- **Exemplo**:
  ```http
  GET /chave/sucesso?walletId=12345
  ```

### `/chave/falha`

- **Método**: GET
- **Descrição**: Simula uma consulta de chave que não foi encontrada, desde que os saldos dos baldes permitam.
- **Parâmetros**: walletId (ID da wallet que realiza a consulta)
- **Exemplo**:
  ```http
  GET /chave/falha?walletId=12345
  ```

### `/pix/balde/recarga`

- **Método**: POST
- **Descrição**: Simula a recarga dos saldos dos baldes dos clientes e do ISPB.
- **Exemplo**:
  ```http
  POST /pix/balde/recarga
  ```

### `/pix/sucesso`

- **Método**: POST
- **Descrição**: Simula uma transação de Pix bem-sucedida, desde que os saldos dos baldes permitam.
- **Parâmetros**: walletId (ID da wallet que realiza a transação)
- **Exemplo**:
  ```http
  POST /pix/sucesso?walletId=12345
  ```

### `/pix/falha`

- **Método**: POST
- **Descrição**: Simula uma transação de Pix que falhou devido a uma chave inválida, desde que os saldos dos baldes permitam.
- **Parâmetros**: walletId (ID da wallet que realiza a transação)
- **Exemplo**:
  ```http
  POST /pix/falha?walletId=12345
  ```

## Rotas BFF (Backend for Frontend)

### `/bff/dashboard`

- **Método**: GET
- **Descrição**: Retorna os saldos dos baldes formatados para exibição no frontend.
- **Exemplo**:
  ```http
  GET /bff/dashboard
  ```

### `/bff/chave/sucesso`

- **Método**: GET
- **Descrição**: Simula uma consulta de chave bem-sucedida através do BFF.
- **Parâmetros**: walletId (ID da wallet que realiza a consulta)
- **Exemplo**:
  ```http
  GET /bff/chave/sucesso?walletId=12345
  ```

### `/bff/chave/falha`

- **Método**: GET
- **Descrição**: Simula uma consulta de chave que não foi encontrada através do BFF.
- **Parâmetros**: walletId (ID da wallet que realiza a consulta)
- **Exemplo**:
  ```http
  GET /bff/chave/falha?walletId=12345
  ```

### `/bff/pix/sucesso`

- **Método**: POST
- **Descrição**: Simula uma transação de Pix bem-sucedida através do BFF.
- **Parâmetros**: walletId (ID da wallet que realiza a transação)
- **Exemplo**:
  ```http
  POST /bff/pix/sucesso?walletId=12345
  ```

### `/bff/pix/falha`

- **Método**: POST
- **Descrição**: Simula uma transação de Pix que falhou através do BFF.
- **Parâmetros**: walletId (ID da wallet que realiza a transação)
- **Exemplo**:
  ```http
  POST /bff/pix/falha?walletId=12345
  ```

### `/bff/recarga`

- **Método**: POST
- **Descrição**: Simula a recarga dos saldos dos baldes através do BFF.
- **Exemplo**:
  ```http
  POST /bff/recarga
  ```

## Worker de Recarga

Este worker executa a tarefa de recarregar os saldos dos baldes em intervalos regulares, simulando a recarga de fichas.

- **Intervalo de Execução**: A cada 2 segundos.

Lembre-se de que esta API é exclusivamente para fins de simulação e não realiza transações ou consultas reais. Ela é destinada a testes e cenários de treinamento. Certifique-se de adaptar a documentação e os exemplos de uso conforme necessário para seu ambiente de desenvolvimento.

# Inicializando o Projeto

Siga estes passos para iniciar o projeto:

1. Clone o repositório.
2. Acesse o diretório do projeto.
3. Instale as dependências com `npm install`.

## Comandos Disponíveis

- `npm run build`: Compila o código TypeScript.
- `npm run build:frontend`: Compila o frontend React.
- `npm run worker`: Inicia o worker de recarga de fichas.
- `npm run server`: Inicia o servidor da API.
- `npm start`: Inicia ambos worker e servidor.
- `npm run dev:worker`: Inicia o worker em modo de desenvolvimento.
- `npm run dev:server`: Inicia o servidor em modo de desenvolvimento.
- `npm run dev:frontend`: Inicia o frontend em modo de desenvolvimento.

Lembre-se de configurar o arquivo `.env` conforme necessário.

Acesse a documentação das rotas da API na seção anterior.

## Créditos

Este projeto foi desenvolvido por Bruno Vieira como parte de um projeto de simulação para fins educacionais e de treinamento.