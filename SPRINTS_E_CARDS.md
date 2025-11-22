# Gestão de Sprints e Cards para Implementação do Frontend

## Sprint 1: Preparação do Ambiente e Estrutura

### Cards:
1. **[CONFIG-001] Configurar dependências React e Bootstrap**
   - Instalar react, react-dom, bootstrap, react-bootstrap
   - Instalar react-router-dom e axios
   - Atualizar package.json

2. **[CONFIG-002] Configurar ferramenta de build (Vite)**
   - Instalar Vite e dependências
   - Configurar vite.config.js
   - Criar estrutura básica de projeto

3. **[CONFIG-003] Criar estrutura de pastas**
   - Criar diretórios: src/frontend, src/bff, public
   - Organizar controllers atuais em src/api
   - Configurar tsconfig para múltiplas builds

## Sprint 2: Desenvolvimento do BFF

### Cards:
4. **[BFF-001] Criar endpoint BFF /bff/dashboard**
   - Implementar rota GET /bff/dashboard
   - Agregar dados de saldos dos buckets
   - Retornar dados formatados para frontend

5. **[BFF-002] Criar endpoints BFF para operações PIX**
   - Implementar POST /bff/pix/sucesso
   - Implementar POST /bff/pix/falha
   - Integrar com API existente

6. **[BFF-003] Criar endpoints BFF para operações de chaves**
   - Implementar GET /bff/chave/sucesso
   - Implementar GET /bff/chave/falha
   - Integrar com API existente

7. **[BFF-004] Criar endpoint BFF para recarga**
   - Implementar POST /bff/recarga
   - Integrar com API existente

## Sprint 3: Desenvolvimento do Frontend - Componentes Base

### Cards:
8. **[FE-001] Criar componente App principal**
   - Configurar estrutura básica do React
   - Implementar React Router
   - Criar layout base com navegação

9. **[FE-002] Criar página Dashboard**
   - Implementar exibição de saldos dos buckets
   - Criar cards com React Bootstrap
   - Estilizar com Bootstrap

10. **[FE-003] Criar componente de navegação**
    - Implementar navbar com React Bootstrap
    - Configurar rotas para diferentes páginas
    - Adicionar links para funcionalidades

## Sprint 4: Desenvolvimento do Frontend - Funcionalidades PIX

### Cards:
11. **[FE-004] Criar página de transações PIX**
    - Implementar formulário para PIX bem-sucedido
    - Implementar formulário para PIX malsucedido
    - Adicionar seleção de wallet

12. **[FE-005] Criar componentes de resultado para PIX**
    - Implementar modais para exibir resultados
    - Tratar diferentes status codes
    - Estilizar mensagens de sucesso/erro

## Sprint 5: Desenvolvimento do Frontend - Funcionalidades Chaves

### Cards:
13. **[FE-006] Criar página de consultas de chaves**
    - Implementar formulário para consulta bem-sucedida
    - Implementar formulário para consulta malsucedida
    - Adicionar seleção de wallet

14. **[FE-007] Criar componentes de resultado para chaves**
    - Implementar modais para exibir resultados
    - Tratar diferentes status codes
    - Estilizar mensagens de sucesso/erro

## Sprint 6: Integração e Build

### Cards:
15. **[INT-001] Configurar chamadas API para endpoints BFF**
    - Criar serviço para chamadas HTTP
    - Implementar tratamento de loading
    - Tratar erros de comunicação

16. **[INT-002] Implementar estado de loading e erros**
    - Adicionar spinners durante requisições
    - Implementar tratamento de erros
    - Melhorar UX com feedback visual

17. **[BUILD-001] Configurar build do React**
    - Configurar script de build no package.json
    - Gerar build otimizado
    - Testar build localmente

18. **[BUILD-002] Configurar Express para servir frontend**
    - Servir arquivos estáticos da pasta build
    - Configurar rota raiz para servir o frontend
    - Manter rotas da API e BFF funcionando

## Sprint 7: Testes e Finalização

### Cards:
19. **[TEST-001] Testar integração completa**
    - Verificar funcionamento de todas as rotas
    - Testar cenários de sucesso e erro
    - Validar responsividade

20. **[TEST-002] Otimizar para produção**
    - Configurar cache de arquivos estáticos
    - Verificar performance
    - Garantir desempenho adequado

21. **[DOC-001] Atualizar documentação**
    - Documentar novos endpoints BFF
    - Atualizar README com instruções de uso
    - Documentar scripts disponíveis