# Simulador de Fichas BACEN - Guia de Execução

## 📋 Pré-requisitos

- Node.js v20+ instalado
- npm ou yarn instalado

## 🏗️ Arquitetura do Projeto

Este projeto consiste em 3 componentes principais:

1. **Worker (Cron Job)** - Recarrega fichas automaticamente a cada 2 minutos
2. **Server (Backend API + BFF)** - Fornece API REST e camada BFF para o frontend
3. **Frontend (React + Vite)** - Interface web para visualização e interação

## 🚀 Como Executar

### Opção 1: Produção (Recomendado)

Execute todos os componentes de uma vez:

```bash
./start-all.sh
```

Este script irá:
1. Compilar o TypeScript (`npm run build`)
2. Compilar o Frontend (`npm run build:frontend`)
3. Iniciar Worker + Server simultaneamente (`npm start`)

### Opção 2: Desenvolvimento

#### Terminal 1 - Worker
```bash
npm run dev:worker
```

#### Terminal 2 - Server
```bash
npm run dev:server
```

#### Terminal 3 - Frontend (modo dev com hot reload)
```bash
npm run dev:frontend
```

### Opção 3: Comandos Individuais

#### Compilar TypeScript
```bash
npm run build
```

#### Compilar Frontend
```bash
npm run build:frontend
```

#### Iniciar Worker
```bash
npm run worker
```

#### Iniciar Server
```bash
npm run server
```

#### Iniciar Worker + Server juntos
```bash
npm start
```

## 🔧 Configuração

Edite o arquivo `.env` para ajustar:

```env
ISPB=03311443          # ISPB do banco simulado
BALDE_ISPB=300         # Limite de fichas do balde ISPB
BALDE_CNPJ=100         # Limite de fichas do balde CNPJ
PORT=3000              # Porta do servidor backend
URL=http://localhost:3000  # URL base da API
CRON=2                 # Intervalo de recarga em minutos
```

## 🌐 Endpoints

### API (Backend)
- Base: `http://localhost:3000/api`

### BFF (Backend for Frontend)
- Base: `http://localhost:3000/bff`

### Frontend
- **Desenvolvimento**: `http://localhost:3001` (com Vite dev server)
- **Produção**: `http://localhost:3000` (servido pelo backend)

## 📁 Estrutura de Diretórios

```
.
├── src/
│   ├── server.ts              # Servidor Express principal
│   ├── cron.ts                # Worker de recarga
│   ├── routes.ts              # Rotas da API
│   ├── api/                   # Controladores e modelos da API
│   ├── bff/                   # Camada BFF
│   └── frontend/              # Aplicação React
├── dist/                      # TypeScript compilado
├── frontend-build/            # Frontend compilado (produção)
└── .env                       # Variáveis de ambiente
```

## 🐛 Troubleshooting

### Erro: "Cannot find module '/dist/server.js'"
Execute `npm run build` primeiro.

### Erro: Frontend não carrega
Execute `npm run build:frontend` para compilar o frontend.

### Porta já em uso
Verifique se outro processo está usando a porta 3000:
```bash
lsof -i :3000
```

## 📝 Notas Importantes

- ⚠️ Este é um **simulador** - não realiza transações reais
- 🔄 O worker recarrega fichas automaticamente conforme configurado em `CRON`
- 🎯 Use apenas para testes, treinamento e desenvolvimento
