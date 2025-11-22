# Research: Botão de Refresh no Dashboard

**Feature**: 001-adicionar-botao-refresh-dashboard  
**Date**: 2025-11-22

## Phase 0: Research & Unknowns Resolution

### Research Tasks Completed

#### 1. Existing Dashboard Implementation Analysis

**Question**: How does the current Dashboard component manage state and fetch data?

**Findings**:
- Current implementation uses React hooks: `useState` for data/loading/error, `useEffect` for initial fetch
- Already has `apiService.getDashboard()` method that calls `/bff/dashboard` endpoint
- Component already handles loading states with Bootstrap `Spinner` component
- Existing button "Recarregar Buckets" calls `apiService.recargaBuckets()` which triggers actual bucket reload
- Dashboard component is located at: `src/frontend/pages/Dashboard.tsx`

**Decision**: Reuse existing state management pattern and API service method. Add new refresh function that only calls `getDashboard()` without `recargaBuckets()`.

**Rationale**: Consistency with existing codebase, minimal code changes, proven loading state pattern.

#### 2. React-Bootstrap Button + Spinner Patterns

**Question**: What React-Bootstrap components and patterns should be used for button loading states?

**Findings**:
- Project already uses `react-bootstrap` v2.10.10 (imported in Dashboard.tsx)
- Current "Recarregar Buckets" button already demonstrates the pattern:
  ```tsx
  <Button disabled={loading}>
    {loading ? (
      <>
        <Spinner as="span" animation="border" size="sm" /> Recarregando...
      </>
    ) : (
      'Recarregar Buckets'
    )}
  </Button>
  ```
- Bootstrap classes for positioning: `d-flex`, `justify-content-end`, `mb-3` for top-right placement
- No additional dependencies needed

**Decision**: Use identical pattern as existing button, but with text "Atualizar" → "Atualizando..." per spec.

**Rationale**: Maintains UI consistency, proven implementation, zero learning curve for maintainers.

**Alternatives Considered**:
- Custom CSS spinner: Rejected - Bootstrap spinner already imported and styled
- Disable entire dashboard during refresh: Rejected - spec requires only button disable
- Icon-only button: Rejected - spec requires text change for clarity

#### 3. Error Handling Strategy for Silent Failures

**Question**: How should errors be handled silently without user notifications?

**Findings**:
- Spec clarification (Session 2025-11-22): "Sem notificações ou toast (botão será clicado múltiplas vezes, sem necessidade de feedback de erro)"
- Current implementation uses `Alert` components for errors - this violates spec for refresh feature
- React error boundaries not needed (component-level try-catch sufficient)
- Console logging acceptable for debugging (not visible to end users)

**Decision**: On fetch error in refresh handler:
1. Log error to console (`console.error()`)
2. Reset loading state to false
3. Do NOT update error state (no Alert shown)
4. Button returns to normal, allowing immediate retry

**Rationale**: Aligns with spec requirement for silent handling, allows user to retry without dismissing error messages.

**Alternatives Considered**:
- Toast notifications: Rejected per spec clarification
- Error badge on button: Rejected - adds complexity, spec says silent
- Retry countdown: Rejected - spec says immediate retry allowed

#### 4. Button Placement and Positioning

**Question**: How to position button in top-right corner of dashboard?

**Findings**:
- Dashboard title is in `<h1>` tag without wrapper
- Current "Recarregar Buckets" button already positioned using flexbox: 
  ```tsx
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h1>Dashboard de Buckets</h1>
    <Button>...</Button>
  </div>
  ```
- This creates header with title (left) and button (right)
- Spec clarification: "canto superior direito" (top-right corner)

**Decision**: Place new refresh button next to existing "Recarregar Buckets" button OR replace it entirely based on user story interpretation.

**Interpretation**: Spec wants button to show "status atual do balde" without triggering recarga. Existing button triggers recarga. These are different actions. **Recommendation**: Keep both buttons, but make refresh button primary (visually prominent).

**Rationale**: Two distinct use cases - manual force recarga vs viewing current state. Keeping both provides full functionality.

#### 5. Refresh Scope and Data Flow

**Question**: What data should be refreshed and how?

**Findings**:
- Spec FR-002: "Sistema DEVE buscar dados atualizados do endpoint BFF `/bff/dashboard`"
- Spec Clarification Q5: "Only update dashboard display data (fetch from `/bff/dashboard`)"
- BFF endpoint `/bff/dashboard` returns: `{ clients: Wallet[], ispb: ISPB }`
- Dashboard component already has type definitions: `DashboardData`, `Wallet`, `ISPB`
- No need to modify backend or BFF layer

**Decision**: Refresh function calls existing `apiService.getDashboard()` and updates `dashboardData` state. No API changes needed.

**Rationale**: Complete alignment with spec, minimal implementation, reuses proven endpoint.

### Technology Decisions

| Technology Choice | Decision | Alternatives Considered | Rationale |
|-------------------|----------|------------------------|-----------|
| State Management | React useState hooks | Redux, Zustand, Context API | Feature is simple, local state sufficient, consistent with existing code |
| API Client | Existing axios via apiService | fetch API, direct axios calls | Reuse existing service layer, maintains abstraction |
| Loading Indicator | React-Bootstrap Spinner | Custom CSS, third-party library | Already imported, consistent UI, zero bundle size increase |
| Button Component | React-Bootstrap Button | Native button, custom component | Matches existing dashboard buttons, accessible by default |
| Error Logging | console.error() | External logging service, silent failure | Debugging support without user interruption, sufficient for simulator |

### Best Practices Applied

#### React Best Practices
- Functional components with hooks (existing pattern)
- Single responsibility: separate refresh logic from recarga logic
- Descriptive state variables: `isRefreshing` instead of generic `loading2`
- Event handler naming: `handleRefresh` (verb + noun)
- Controlled components: button disabled state tied to loading state

#### TypeScript Best Practices
- Reuse existing interfaces (`DashboardData`, `Wallet`, `ISPB`)
- Strict null checks: handle `dashboardData | null` state
- Type-safe async/await with proper error typing

#### UX Best Practices (Per Constitution VII & VIII)
- Immediate feedback: Spinner appears < 100ms after click
- Clear action labeling: "Atualizar" → "Atualizando..."
- Silent error handling: No modal/toast interruptions
- Touch-friendly: Bootstrap button sizing (44x44px minimum)
- Keyboard accessible: Button focusable and activatable via Enter/Space

#### Performance Considerations
- Debouncing not needed (button disabled during request prevents spam)
- No memory leaks: async function checks component mount state (React 19 handles this)
- Minimal re-renders: only `dashboardData` and `isRefreshing` states change

### Integration Points

**Existing Code to Reuse**:
1. `apiService.getDashboard()` - Already tested, returns correct data structure
2. `DashboardData` interface - Type-safe data handling
3. Bootstrap Spinner component - Consistent loading indicator
4. Button disable pattern - Prevents duplicate requests

**Existing Code to Avoid Modifying**:
1. `/bff/dashboard` endpoint - No changes needed
2. `apiService.recargaBuckets()` - Keep separate for existing functionality
3. Dashboard data display logic - Only state updates, no rendering changes needed

### Open Questions Resolved

1. ~~Should we replace or supplement existing "Recarregar Buckets" button?~~  
   **Resolved**: Keep both - different use cases (refresh view vs trigger recarga)

2. ~~What text should appear during loading?~~  
   **Resolved**: "Atualizando..." per spec clarification

3. ~~Should we show any error indicator?~~  
   **Resolved**: No - silent error handling per spec clarification

4. ~~Is timeout configuration needed?~~  
   **Resolved**: No - use default axios timeout per spec clarification

5. ~~Button placement exact location?~~  
   **Resolved**: Top-right corner, next to existing button using flexbox

### Summary

All unknowns from Technical Context have been resolved through code analysis and spec clarifications. The implementation approach is clear:
- Frontend-only modification
- Reuse existing infrastructure (API service, BFF endpoint, Bootstrap components)
- Add minimal new state (`isRefreshing`) and handler (`handleRefresh`)
- Follow established React/TypeScript patterns
- Zero new dependencies required

**Ready for Phase 1: Design & Contracts**
