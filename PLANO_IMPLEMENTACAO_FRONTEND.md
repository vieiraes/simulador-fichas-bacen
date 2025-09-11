# Plano de Implementação - Frontend com BFF para Simulador de Fichas Bacen

## Visão Geral
Este documento descreve os passos necessários para implementar um frontend bonito e funcional para o simulador de fichas Bacen, utilizando React, Bootstrap e uma arquitetura BFF (Backend for Frontend) no mesmo repositório.

## Tecnologias Escolhidas
- **Frontend**: React + React Bootstrap
- **Backend**: Node.js/Express (mantendo a API atual)
- **Integração**: BFF (Backend for Frontend) no mesmo servidor
- **Build**: Webpack/Vite para compilação do frontend

## Estrutura de Pastas Proposta
```
simulador-fichas-bacen/
├── src/
│   ├── api/           # APIs atuais (controllers, routes, models)
│   ├── bff/           # Novas rotas BFF para frontend
│   ├── frontend/      # Componentes React
│   └── server.ts      # Servidor principal
├── public/            # Arquivos estáticos do React
├── frontend-build/    # Build do frontend (React)
└── ...
```

## Etapas de Implementação

### Etapa 1: Preparação do Ambiente
1. Instalar dependências React:
   - `react`
   - `react-dom`
   - `bootstrap`
   - `react-bootstrap`
   - `react-router-dom` (para navegação)
   - `axios` (para chamadas HTTP)

2. Configurar ferramenta de build:
   - Escolher entre Webpack ou Vite
   - Configurar build para gerar arquivos estáticos em `frontend-build/`

3. Criar estrutura de pastas:
   - Criar diretórios `src/frontend`, `src/bff`, `public`
   - Mover controllers atuais para `src/api` (se necessário)

### Etapa 2: Desenvolvimento do BFF
1. Criar endpoints BFF que agregam dados:
   - `GET /bff/dashboard` - Retorna dados consolidados para o dashboard
   - `POST /bff/pix/sucesso` - Processa transação PIX bem-sucedida
   - `POST /bff/pix/falha` - Processa transação PIX malsucedida
   - `GET /bff/chave/sucesso` - Processa consulta de chave bem-sucedida
   - `GET /bff/chave/falha` - Processa consulta de chave malsucedida
   - `POST /bff/recarga` - Processa recarga de buckets

2. Implementar lógica de agregação:
   - Chamar endpoints da API existente
   - Consolidar dados para envio otimizado ao frontend

### Etapa 3: Desenvolvimento do Frontend React
1. Criar estrutura de componentes:
   - Componente App principal
   - Componente Dashboard
   - Componentes de formulário para PIX e chaves
   - Componentes de exibição de resultados

2. Desenvolver páginas:
   - Página Dashboard (status dos buckets)
   - Página de transações PIX
   - Página de consultas de chaves

3. Implementar navegação:
   - Configurar rotas com React Router
   - Criar menu de navegação

### Etapa 4: Estilização com Bootstrap
1. Integrar React Bootstrap:
   - Utilizar componentes como Cards, Buttons, Forms
   - Aplicar tema Bootstrap padrão ou personalizado

2. Criar layout responsivo:
   - Grid system do Bootstrap
   - Componentes adaptáveis para diferentes tamanhos de tela

### Etapa 5: Integração Frontend-Backend
1. Configurar chamadas API:
   - Criar serviço para chamadas aos endpoints BFF
   - Implementar tratamento de loading e erros

2. Testar integração:
   - Verificar comunicação entre frontend e BFF
   - Validar exibição de dados

### Etapa 6: Build e Configuração do Servidor
1. Configurar build do React:
   - Gerar build otimizado na pasta `frontend-build/`

2. Configurar Express para servir frontend:
   - Servir arquivos estáticos da pasta `frontend-build/`
   - Configurar rota raiz para servir o frontend
   - Manter rotas da API e BFF funcionando

3. Otimizar para produção:
   - Configurar cache de arquivos estáticos
   - Garantir desempenho adequado

## Scripts Necessários
- `npm run build:frontend` - Build do frontend React
- `npm run build` - Build completo (API + frontend)
- `npm run dev:frontend` - Desenvolvimento do frontend
- `npm start` - Iniciar servidor com frontend e API

## Critérios de Sucesso
1. Frontend bonito e responsivo usando Bootstrap
2. Funcionalidades completas de simulação
3. Integração correta entre frontend e backend
4. Build e deploy funcionando corretamente
5. Manutenção da API existente sem quebras