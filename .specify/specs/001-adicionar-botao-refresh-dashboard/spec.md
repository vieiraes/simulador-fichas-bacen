# Feature Specification: Botão de Refresh no Dashboard

**Feature Branch**: `001-adicionar-botao-refresh-dashboard`  
**Created**: 2025-01-24  
**Status**: Draft  
**Input**: User description: "preciso ter um botao no front para atualizar o status atual do balde do bacen. pois hoje no projeto, nao temos como saber qual o numero de fichas se eu nao atualizar a pagina, pois como temos um cron rodando em paralelo seria necessario termos um botao para puxar o status atual"

## User Scenarios & Manual Validation *(mandatory)*

### User Story 1 - Visualizar Status Atualizado do Balde (Priority: P1)

Como usuário do dashboard, preciso ver o número atualizado de fichas do balde do BACEN sem recarregar toda a página, para acompanhar as mudanças em tempo real causadas pelo worker cron.

**Why this priority**: Este é o valor central da feature. Sem isso, não há como o usuário ver as atualizações do cron (que roda a cada 2 minutos) sem fazer refresh manual da página inteira, tornando o dashboard pouco útil para monitoramento em tempo real.

**Manual Validation Method**: Pode ser completamente validado no browser:
1. Abrir dashboard e ver o valor inicial do balde
2. Aguardar 2 minutos (ciclo do cron) sem recarregar
3. Clicar no botão de refresh
4. Confirmar que o novo valor aparece refletindo a recarga automática do cron

**Manual Validation Scenarios**:

1. **Given** usuário está visualizando o dashboard com balde mostrando 100 fichas, **When** cron executa recarga e usuário clica no botão refresh, **Then** dashboard exibe o novo valor (ex: 200 fichas) sem recarregar a página
2. **Given** múltiplos clientes têm seus baldes atualizados pelo cron, **When** usuário clica refresh, **Then** todos os valores de balde (ISPB e clientes) são atualizados simultaneamente
3. **Given** usuário está vendo dados antigos, **When** clica refresh múltiplas vezes seguidas, **Then** cada clique busca os dados mais recentes disponíveis

---

### User Story 2 - Feedback Visual Durante Atualização (Priority: P2)

Como usuário, preciso ver um indicador visual claro quando o sistema está buscando dados atualizados, para saber que minha ação foi reconhecida e o sistema está processando.

**Why this priority**: Fornece feedback de UX essencial, mas não é bloqueante - o refresh pode funcionar sem isso, apenas com menos clareza para o usuário.

**Manual Validation Method**: Validação visual no browser:
1. Clicar no botão refresh
2. Observar indicador de loading (spinner, texto, ou desabilitação do botão)
3. Confirmar que indicador desaparece quando dados são carregados

**Manual Validation Scenarios**:

1. **Given** usuário clica no botão refresh, **When** requisição está em andamento, **Then** botão mostra estado de loading (ex: spinner ou texto "Atualizando...")
2. **Given** requisição de refresh está em andamento, **When** usuário tenta clicar novamente, **Then** botão está desabilitado para evitar múltiplas requisições simultâneas
3. **Given** dados foram carregados com sucesso, **When** loading termina, **Then** botão volta ao estado normal e dados atualizados são exibidos

---

### User Story 3 - Tratamento de Erros de Conexão (Priority: P3)

Como usuário, preciso ser informado quando a atualização falha, para entender que os dados na tela podem não estar atualizados e tentar novamente.

**Why this priority**: Importante para robustez, mas ocorre apenas em cenários de falha. O happy path (P1 e P2) já entrega valor substancial.

**Manual Validation Method**: Simular falha de rede no browser (DevTools → Network → Offline) e tentar refresh

**Manual Validation Scenarios**:

1. **Given** conexão com backend está indisponível, **When** usuário clica refresh, **Then** sistema exibe mensagem de erro clara (ex: "Não foi possível atualizar. Tente novamente.")
2. **Given** erro de atualização ocorreu, **When** usuário clica refresh novamente com conexão restaurada, **Then** dados são atualizados normalmente e mensagem de erro desaparece
3. **Given** timeout na requisição, **When** tempo limite é excedido, **Then** loading para e usuário recebe feedback de erro

---

### Edge Cases

- O que acontece quando usuário clica refresh enquanto dados ainda estão sendo carregados da primeira requisição?
- Como sistema se comporta se backend retornar dados parciais (ex: apenas ISPB sem clientes)?
- O que ocorre se cron estiver desabilitado e valores não mudarem após múltiplos refreshes?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE adicionar um botão visível no dashboard para solicitar atualização dos dados de balde
- **FR-002**: Sistema DEVE buscar dados atualizados do endpoint BFF `/bff/dashboard` quando botão for clicado
- **FR-003**: Sistema DEVE atualizar a interface com os novos valores de balde (ISPB e todos os clientes) após receber resposta
- **FR-004**: Sistema DEVE exibir indicador visual durante o carregamento (botão em estado loading)
- **FR-005**: Sistema DEVE desabilitar o botão durante requisição para evitar cliques duplicados
- **FR-006**: Sistema DEVE exibir mensagem de erro ao usuário quando atualização falhar
- **FR-007**: Sistema DEVE manter a atualização automática do cron independente (não deve interferir com refresh manual)
- **FR-008**: Sistema DEVE preservar o estado atual da página (não fazer reload completo) durante refresh

### Key Entities

- **Dashboard State**: Representa o estado atual do dashboard com valores de balde (ISPB e clientes)
  - Atributos: loading status, error status, dados de balde atualizados
  - Relação: Consumido pelo componente Dashboard.tsx
  
- **Balde Data**: Representa as informações de fichas do BACEN
  - Atributos: valor do balde ISPB, array de clientes com seus respectivos baldes
  - Relação: Retornado pelo endpoint `/bff/dashboard`, exibido no dashboard

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem ver atualizações de balde em menos de 2 segundos após clicar no botão refresh (tempo de requisição + renderização)
- **SC-002**: Sistema responde ao clique do botão com feedback visual imediato (menos de 100ms para mostrar loading)
- **SC-003**: 100% das atualizações bem-sucedidas refletem os valores mais recentes disponíveis no backend
- **SC-004**: Usuários conseguem identificar claramente quando atualização está em andamento através de indicador visual
- **SC-005**: Em caso de falha de conexão, usuário recebe mensagem de erro clara e pode tentar novamente sem recarregar a página
