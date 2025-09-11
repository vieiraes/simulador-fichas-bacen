# Documentação de Arquitetura - Simulador de Controle de Fichas DICT

## Visão Geral

Este documento descreve a arquitetura e o funcionamento do Simulador de Controle de Fichas DICT, uma aplicação Node.js/TypeScript que simula o comportamento do sistema de limitação de consultas e transações do DICT (Diretório de Identificadores de Contas Transacionais) do Bacen.

## Tecnologias Utilizadas

- **Linguagem**: TypeScript
- **Runtime**: Node.js
- **Framework Web**: Express.js
- **Frontend**: React com Bootstrap
- **Build Tool**: Vite
- **Agendamento**: node-cron
- **HTTP Client**: axios
- **Gerenciamento de Configuração**: dotenv

## Estrutura de Pastas

```
src/
├── api/             # API principal (controllers, models, routes)
├── bff/             # Backend for Frontend
├── frontend/        # Aplicação frontend React
├── cron.ts          # Worker de recarga automática
├── routes.ts        # Definição das rotas da API
├── server.ts        # Ponto de entrada do servidor HTTP
```

## Componentes Principais

### 1. Servidor HTTP (server.ts)

- Ponto de entrada da aplicação
- Configura o servidor Express na porta definida (padrão 3000)
- Carrega as rotas da API e BFF
- Serve os arquivos estáticos do frontend

### 2. API Principal (src/api/)

#### Rotas (src/api/routes.ts)
- Mapeia os endpoints da API para os respectivos controladores
- `/pix` - Rotas relacionadas a transações PIX
- `/chave` - Rotas relacionadas a consultas de chaves
- `/balde` - Rotas relacionadas aos saldos dos buckets

#### Models (src/api/models/wallets.model.ts)
- Gerencia o estado dos buckets dos participantes
- Define os wallets dos clientes (3 por padrão)
- Define o bucket ISPB do banco central
- Os valores são configuráveis via variáveis de ambiente

#### Controllers (src/api/controllers/)
##### Baldes.controller.ts
- Fornece endpoint para consulta de saldos dos buckets

##### Pix.controller.ts
- Implementa simulação de transações PIX bem-sucedidas e malsucedidas
- Gerencia a lógica de recarga dos buckets

##### Chaves.controller.ts
- Implementa simulação de consultas de chaves bem-sucedidas e malsucedidas

### 3. BFF (Backend for Frontend) (src/bff/)

#### Rotas BFF (src/bff/routes.ts)
- `/bff/dashboard` - Endpoint para dados do dashboard
- `/bff/pix` - Rotas para operações PIX
- `/bff/chave` - Rotas para operações de chaves
- `/bff/recarga` - Endpoint para recarga de buckets

#### Controllers BFF (src/bff/controllers/)
- Agregam dados da API principal para otimização do frontend
- Formatam respostas específicas para a interface web

### 4. Frontend (src/frontend/)

#### Componentes
- Dashboard com visualização dos saldos dos buckets
- Formulários para transações PIX
- Formulários para consultas de chaves
- Componentes de navegação e layout

#### Services
- Serviço de API para comunicação com endpoints BFF
- Gerenciamento de estado e loading

### 5. Worker de Recarga (cron.ts)

- Executa periodicamente a recarga dos buckets
- Intervalo configurável via variável de ambiente (padrão 2 segundos)
- Chama o endpoint de recarga para atualizar os saldos

## Variáveis de Ambiente (.env)

- `ISPB`: Código ISPB do participante (padrão: 03311443)
- `BALDE_ISPB`: Limite do bucket ISPB (padrão: 300)
- `BALDE_CNPJ`: Limite dos buckets CNPJ/clientes (padrão: 100)
- `PORT`: Porta do servidor (padrão: 3000)
- `URL`: URL base da aplicação (padrão: http://localhost:3000)
- `CRON`: Intervalo do worker de recarga em segundos (padrão: 2)

## Endpoints da API

### Consulta de Saldos
- `GET /balde/saldos` - Retorna os saldos atuais de todos os buckets

### Recarga de Buckets
- `POST /pix/balde/recarga` - Executa a recarga dos buckets

### Transações PIX
- `POST /pix/sucesso?walletId={id}` - Simula transação PIX bem-sucedida
- `POST /pix/falha?walletId={id}` - Simula transação PIX malsucedida (chave inválida)

### Consultas de Chaves
- `GET /chave/sucesso?walletId={id}` - Simula consulta de chave bem-sucedida
- `GET /chave/falha?walletId={id}` - Simula consulta de chave não encontrada

## Endpoints BFF

### Dashboard
- `GET /bff/dashboard` - Retorna dados formatados para o dashboard

### Recarga de Buckets
- `POST /bff/recarga` - Executa a recarga dos buckets através do BFF

### Transações PIX
- `POST /bff/pix/sucesso?walletId={id}` - Simula transação PIX bem-sucedida através do BFF
- `POST /bff/pix/falha?walletId={id}` - Simula transação PIX malsucedida através do BFF

### Consultas de Chaves
- `GET /bff/chave/sucesso?walletId={id}` - Simula consulta de chave bem-sucedida através do BFF
- `GET /bff/chave/falha?walletId={id}` - Simula consulta de chave não encontrada através do BFF

## Regras de Negócio

### Limites de Buckets
- Bucket ISPB: 300 fichas (limite máximo)
- Buckets clientes: 100 fichas cada (limite máximo)

### Requisitos para Transações
- PIX bem-sucedido: 21+ fichas no bucket cliente e 3+ no bucket ISPB
- Consulta de chave bem-sucedida: 21+ fichas no bucket cliente e 1+ no bucket ISPB

### Consumo de Fichas
- Transação PIX bem-sucedida: consome 1 ficha do bucket cliente e 1 do ISPB
- Transação PIX malsucedida: consome 20 fichas do bucket cliente e 3 do ISPB
- Consulta de chave bem-sucedida: consome 1 ficha do bucket cliente e 1 do ISPB
- Consulta de chave malsucedida: consome 20 fichas do bucket cliente e 3 do ISPB

## Scripts Disponíveis

- `npm run build`: Compila o código TypeScript para JavaScript
- `npm run build:frontend`: Compila o frontend React
- `npm run worker`: Inicia apenas o worker de recarga
- `npm run server`: Inicia apenas o servidor HTTP
- `npm start`: Inicia ambos worker e servidor simultaneamente
- `npm run dev:worker`: Inicia o worker em modo de desenvolvimento com hot-reload
- `npm run dev:server`: Inicia o servidor em modo de desenvolvimento com hot-reload
- `npm run dev:frontend`: Inicia o frontend em modo de desenvolvimento com hot-reload

## Padrões de Desenvolvimento

- Separação clara de responsabilidades entre API, BFF e frontend
- Uso de variáveis de ambiente para configuração
- Tipagem estática com TypeScript
- Arquitetura REST para a API
- Componentização no frontend com React
- Uso de BFF para otimização da interface web