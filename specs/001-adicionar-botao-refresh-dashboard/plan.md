# Implementation Plan: Botão de Refresh no Dashboard

**Branch**: `001-adicionar-botao-refresh-dashboard` | **Date**: 2025-11-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-adicionar-botao-refresh-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a refresh button to the Dashboard component that fetches updated bucket data from the existing `/bff/dashboard` endpoint without performing a full page reload or triggering bucket recarga. The button will display visual feedback during loading (spinner + text change) and handle errors silently, allowing users to see real-time updates from the background cron worker.

## Technical Context

**Language/Version**: TypeScript 5.2.2 with React 19.1.1  
**Primary Dependencies**: React 19, React-Bootstrap 2.10.10, Axios 1.5.1, Bootstrap 5.3.8  
**Storage**: N/A (data fetched from existing BFF endpoint)  
**Testing**: NO TESTING - Manual validation via browser only  
**Target Platform**: Web browser (Chrome, Firefox, Safari - responsive design)
**Project Type**: Web application (frontend component modification)  
**Performance Goals**: < 2 seconds from button click to data refresh, < 100ms visual feedback  
**Constraints**: Reuse existing `/bff/dashboard` endpoint, no backend changes, silent error handling  
**Scale/Scope**: Single component modification (Dashboard.tsx), minimal state management changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with Simulador de Fichas BACEN Constitution v2.0.0 principles:

- [x] **API Simulation-First**: N/A - This feature only displays existing simulated data, doesn't introduce new simulation logic
- [x] **API-First Development**: COMPLIANT - Reuses existing `/bff/dashboard` endpoint (already implemented), no backend changes needed
- [x] **Type Safety**: COMPLIANT - Will use existing TypeScript interfaces (Wallet, ISPB, DashboardData) with strict typing
- [x] **Independent Operation**: COMPLIANT - Frontend-only change, Dashboard component remains independently testable via browser
- [x] **Observable State**: COMPLIANT - Refresh button makes bucket state changes observable in real-time via UI updates
- [x] **Clean Code**: COMPLIANT - Will add single-responsibility function `handleRefresh()`, descriptive state variables, minimal nesting
- [x] **Simple UX**: COMPLIANT - Single button action, immediate visual feedback (spinner + text), silent error handling per spec
- [x] **Responsive Design**: COMPLIANT - Button uses Bootstrap classes, will maintain mobile-first approach with existing grid system
- [x] **Minimal Dependencies**: COMPLIANT - Zero new dependencies, uses existing React-Bootstrap components (Button, Spinner)
- [x] **NO TESTING POLICY**: COMPLIANT - Manual validation only: browser testing with dev console, visual verification of refresh behavior

**CRITICAL**: This project uses NO automated tests. Any test-related tasks MUST be removed from plan.

**Assessment**: ALL PRINCIPLES COMPLIANT - No violations to justify. Feature is a minimal UI enhancement reusing existing infrastructure.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── frontend/
│   ├── pages/
│   │   └── Dashboard.tsx          # MODIFIED: Add refresh button, loading state, error handling
│   └── services/
│       └── api.ts                 # UNCHANGED: getDashboard() method already exists
├── bff/
│   └── controllers/
│       └── Dashboard.controller.ts # UNCHANGED: /bff/dashboard endpoint already exists
```

**Structure Decision**: Frontend-only modification. This is a web application with existing separation between BFF backend (`src/bff/`) and React frontend (`src/frontend/`). The feature requires changes only to the Dashboard component - no new files, no new services, no backend modifications. Existing API infrastructure is reused.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Assessment**: No violations found. All Constitution principles are compliant.

## Implementation Phases

### Phase 0: Research & Analysis ✅

**Status**: COMPLETE  
**Output**: `research.md`

**Summary**: 
- Analyzed existing Dashboard.tsx component structure (useState hooks, useEffect, existing button patterns)
- Documented React-Bootstrap Button + Spinner pattern (already in use)
- Defined error handling strategy (silent console.error only, no user alerts)
- Determined button placement (flexbox header with justify-content-between)
- Clarified refresh scope (fetch /bff/dashboard only, no recarga trigger)
- Technology decisions: Zero new dependencies, reuse existing apiService.getDashboard()

**Key Findings**:
- Can reuse handleRecarga pattern for refresh implementation
- All required UI components already imported (Button, Spinner from react-bootstrap)
- Minimal state changes needed (1 boolean: isRefreshing)

### Phase 1: Design & Contracts ✅

**Status**: COMPLETE  
**Outputs**: `data-model.md`, `contracts/api-contract.md`, `quickstart.md`

**Summary**:
- **Data Model**: Documented 3 existing entities (Wallet, ISPB, DashboardData) + 1 new state variable (isRefreshing)
- **API Contract**: Documented existing /bff/dashboard endpoint (GET, success/error responses, performance characteristics)
- **Quickstart Guide**: Created step-by-step implementation guide with 4 code steps, 5 manual validation scenarios, troubleshooting tips

**Agent Context**: Updated `.github/agents/copilot-instructions.md` with TypeScript/React stack details

**Key Decisions**:
- Frontend-only implementation (zero backend changes)
- Reuse existing /bff/dashboard endpoint
- Silent error handling (console.error only, no UI alerts)
- Loading state follows existing handleRecarga pattern

### Phase 2: Tasks & Implementation Planning ⏳

**Status**: PENDING  
**Output**: `tasks.md` (generated by `/speckit.tasks` command)

**Next Step**: Execute `/speckit.tasks` to break down implementation into actionable tasks organized by user story.

**Expected Tasks**:
1. Add isRefreshing state to Dashboard.tsx
2. Implement handleRefresh async function
3. Add "Atualizar" button with conditional rendering
4. Manual validation (5 test scenarios from quickstart.md)

**Estimated Time**: 30 min implementation + 15 min manual validation = 45 min total
