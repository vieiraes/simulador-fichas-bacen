# API Simulador de Controle de Fichas DICT

Esta API foi desenvolvida exclusivamente para simular cenários de transações e consultas no DICT (Diretório de Identificadores de Contas Transacionais). Não realiza transações ou consultas reais, mas simula o comportamento das regras de limitação de consultas.

## Rotas

### `/saldos`

- **Método**: GET
- **Descrição**: Retorna os saldos dos baldes dos clientes e do ISPB.
- **Exemplo**:
  ```http
  GET /saldos
  ```

### `/sucesso`

- **Método**: GET
- **Descrição**: Simula uma consulta de chave bem-sucedida, desde que os saldos dos baldes permitam.
- **Parâmetros**: walletId (ID da wallet que realiza a consulta)
- **Exemplo**:
  ```http
  GET /sucesso?walletId=12345
  ```

### `/falha`

- **Método**: GET
- **Descrição**: Simula uma consulta de chave que não foi encontrada, desde que os saldos dos baldes permitam.
- **Parâmetros**: walletId (ID da wallet que realiza a consulta)
- **Exemplo**:
  ```http
  GET /falha?walletId=12345
  ```

### `/balde/recarga`

- **Método**: POST
- **Descrição**: Simula a recarga dos saldos dos baldes dos clientes e do ISPB.
- **Exemplo**:
  ```http
  POST /balde/recarga
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
- `npm run worker`: Inicia o worker de recarga de fichas.
- `npm run server`: Inicia o servidor da API.
- `npm start`: Inicia ambos worker e servidor.
- `npm run dev:worker`: Inicia o worker em modo de desenvolvimento.
- `npm run dev:server`: Inicia o servidor em modo de desenvolvimento.

Lembre-se de configurar o arquivo `.env` conforme necessário.

Acesse a documentação das rotas da API na seção anterior.

## Créditos

Este projeto foi desenvolvido por Bruno Vieira como parte de um projeto de simulação para fins educacionais e de treinamento.