# Simulador de Controle de Fichas DICT (SPA)

Esta aplicação foi desenvolvida exclusivamente para simular cenários de transações e consultas no DICT (Diretório de Identificadores de Contas Transacionais). Não realiza transações ou consultas reais, mas simula o comportamento das regras de limitação de consultas e consumo de "fichas" (tokens).

O projeto foi **refatorado para uma arquitetura 100% Frontend (SPA - Single Page Application)** construída com React, Vite e Bootstrap. Toda a lógica de simulação e "memória" dos baldes vive nativamente no navegador, eliminando a necessidade de um backend dedicado.

## 🚀 Como Executar Localmente

### 1. Instalação
Clone o repositório, acesse a pasta do projeto e instale as dependências:

```bash
npm install
```

### 2. Rodando em Desenvolvimento
Inicie o servidor de desenvolvimento do Vite:

```bash
npm run dev
```
Acesse `http://localhost:3001` (ou a porta informada no terminal) no seu navegador.

---

## 💻 Interface Web (Dashboard)

A aplicação apresenta uma interface web moderna e responsiva na tela inicial (Dashboard), otimizando o uso do espaço:

- **Visualização de Saldos (Baldes):**
  - Exibição em tempo real dos saldos de cada "Cliente" e do balde principal "ISPB".
  - Gráficos de barra de progresso para facilitar o entendimento visual do esgotamento das fichas.
  - Indicadores de status geral (Operacional ou Limitado).

- **Simulador de Operações (Accordion):**
  - Uma seção em formato "sanfona" que agrupa todas as ações simuláveis.
  - Selecione a Wallet do cliente apenas uma vez.
  - Teste cenários isolados clicando nos painéis:
    - **PIX - Sucesso**: Consome 10 fichas do Cliente e 1 ficha do ISPB.
    - **PIX - Falha**: Consome 1 ficha do ISPB, saldo do Cliente intacto.
    - **Consulta Chave - Sucesso**: Consome apenas 1 ficha do Cliente.
    - **Consulta Chave - Falha**: Consome apenas 1 ficha do Cliente.

- **Recarga Automática:**
  - O antigo "cron job" agora é um processo de background (hook reativo) do próprio React que restaura fichas para os baldes automaticamente a cada 2 segundos.
  - Há também um botão manual para recarregar todos os baldes imediatamente.

---

## 🌐 Build e Hospedagem (Firebase)

Como a aplicação não possui mais um servidor Node.js/Express, ela se tornou incrivelmente fácil de hospedar de forma gratuita utilizando serviços de arquivos estáticos, como o **Firebase Hosting**.

Para compilar a versão final otimizada para produção:

```bash
npm run build
```

Isso criará os artefatos estáticos na pasta `dist` (ou `frontend-build`). Caso esteja configurado no Firebase CLI, basta executar:

```bash
npx firebase deploy --only hosting
```

> **Nota sobre concorrência:** Como é uma SPA local, se você abrir a aplicação em duas abas/navegadores diferentes, cada um terá o seu próprio estado e balde independentes. Perfeito para fins de testes isolados e demonstrações de UI!

---

## 🛠️ Tecnologias
- **React (v19)**
- **Vite**
- **React-Bootstrap / Bootstrap 5**
- **TypeScript**

## Créditos
Este projeto foi idealizado e desenvolvido por **Bruno Vieira** como parte de um projeto de simulação para fins educacionais e de treinamento.