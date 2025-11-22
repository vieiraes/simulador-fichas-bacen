# Tasks: Botão de Refresh no Dashboard

**Input**: Design documents from `/specs/001-adicionar-botao-refresh-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contract.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and manual validation of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` (markdown task checkbox - REQUIRED for all tasks)
- **[ID]**: Sequential task number (T001, T002, etc.)
- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3) - ONLY for user story phases
- Include exact file paths in descriptions

**NOTE**: This project does NOT use automated tests. Validation is MANUAL ONLY (browser verification).

---

## Phase 1: Setup

**Purpose**: Project structure verification (no new setup needed - using existing project)

- [X] T001 Verify existing project dependencies are installed (react 19.1.1, react-bootstrap 2.10.10, typescript 5.2.2)
- [X] T002 Verify development server can start successfully (npm start)
- [X] T003 Verify Dashboard.tsx component loads at http://localhost:3000

**Checkpoint**: Development environment ready

---

## Phase 2: Foundational

**Purpose**: Core infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Verify apiService.getDashboard() method exists in src/frontend/services/api.ts (no changes needed)
- [X] T005 Verify /bff/dashboard endpoint responds correctly (manual test with curl or browser)
- [X] T006 Verify Button and Spinner components from react-bootstrap are available in Dashboard.tsx

**Checkpoint**: Foundation ready - all required infrastructure exists and works

---

## Phase 3: User Story 1 - Visualizar Status Atualizado do Balde (Priority: P1) 🎯 MVP

**Goal**: Users can click a button to refresh dashboard data and see updated bucket values from the background cron worker without page reload

**Manual Validation Method**: 
1. Open dashboard and note initial bucket values
2. Wait 2 minutes for cron to run (or manually trigger bucket change)
3. Click refresh button
4. Confirm bucket values update without page reload

### Implementation for User Story 1

- [X] T007 [US1] Add isRefreshing state variable to Dashboard.tsx (after existing useState declarations)
- [X] T008 [US1] Implement handleRefresh async function in src/frontend/pages/Dashboard.tsx (after handleRecarga function)
- [X] T009 [US1] Add "Atualizar" button to dashboard header in src/frontend/pages/Dashboard.tsx (before "Recarregar Buckets" button)

**Checkpoint**: User Story 1 complete - refresh button fetches and displays updated data

### Manual Validation for User Story 1

- [X] T010 [US1] Manual test: Verify button appears in top-right corner next to "Recarregar Buckets"
- [X] T011 [US1] Manual test: Click button and verify dashboard data updates without page reload
- [X] T012 [US1] Manual test: Verify all bucket values (ISPB + clients) update simultaneously
- [X] T013 [US1] Manual test: Click button multiple times in succession and verify each fetch returns latest data
- [X] T014 [US1] Manual test: Verify response time < 2 seconds from click to UI update (check Network tab)

---

## Phase 4: User Story 2 - Feedback Visual Durante Atualização (Priority: P2)

**Goal**: Users see clear visual feedback (spinner + text change + disabled state) while refresh is in progress

**Manual Validation Method**:
1. Click refresh button
2. Observe spinner appears immediately
3. Observe text changes to "Atualizando..."
4. Observe button becomes disabled
5. Confirm all indicators disappear when loading completes

**Dependencies**: Requires User Story 1 completion (button and handleRefresh function must exist)

### Implementation for User Story 2

- [X] T015 [US2] Update "Atualizar" button JSX to conditionally render Spinner component based on isRefreshing state in src/frontend/pages/Dashboard.tsx
- [X] T016 [US2] Update button text to conditionally show "Atualizar" or "Atualizando..." based on isRefreshing in src/frontend/pages/Dashboard.tsx
- [X] T017 [US2] Add disabled={isRefreshing} prop to button in src/frontend/pages/Dashboard.tsx

**Checkpoint**: User Story 2 complete - loading indicators work correctly

### Manual Validation for User Story 2

- [X] T018 [US2] Manual test: Click button and verify spinner icon appears inside button immediately (< 100ms)
- [X] T019 [US2] Manual test: Verify button text changes from "Atualizar" to "Atualizando..." during loading
- [X] T020 [US2] Manual test: Verify button is disabled during loading (clicking has no effect)
- [X] T021 [US2] Manual test: Verify all loading indicators disappear when data loads successfully
- [X] T022 [US2] Manual test: Throttle network to "Slow 3G" in DevTools and verify loading state persists throughout slow request

---

## Phase 5: User Story 3 - Tratamento de Erros de Conexão (Priority: P3)

**Goal**: System handles refresh errors silently (console logging only, no user-facing alerts) and allows immediate retry

**Manual Validation Method**:
1. Open DevTools → Console tab
2. Set Network tab to "Offline"
3. Click refresh button
4. Verify error logged to console (not shown to user)
5. Verify button returns to normal state
6. Restore network and verify button works again

**Dependencies**: Requires User Stories 1 & 2 completion (button, handler, and loading states must exist)

### Implementation for User Story 3

- [X] T023 [US3] Add try-catch block to handleRefresh function in src/frontend/pages/Dashboard.tsx
- [X] T024 [US3] Add console.error() logging in catch block in src/frontend/pages/Dashboard.tsx
- [X] T025 [US3] Add finally block to ensure setIsRefreshing(false) always executes in src/frontend/pages/Dashboard.tsx

**Checkpoint**: User Story 3 complete - error handling works silently

### Manual Validation for User Story 3

- [X] T026 [US3] Manual test: Set Network to "Offline" in DevTools, click button, verify error logged to console only (no Alert or toast shown)
- [X] T027 [US3] Manual test: Verify button returns to "Atualizar" state after error (not stuck in loading state)
- [X] T028 [US3] Manual test: Verify button remains enabled after error (can be clicked immediately for retry)
- [X] T029 [US3] Manual test: After error, restore network and click button again - verify refresh works normally
- [X] T030 [US3] Manual test: Simulate timeout by throttling network extremely, verify loading state eventually resets

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [X] T031 Run complete quickstart.md validation (all 5 test scenarios from quickstart guide)
- [X] T032 Test responsive design: verify button visible and functional on mobile (375px), tablet (768px), desktop (1440px)
- [X] T033 Test with multiple rapid clicks: verify only one request sent (button disables after first click)
- [X] T034 Verify edge case: click refresh while initial page load is in progress - both should complete independently
- [X] T035 Update README.md if needed (add description of refresh button feature)
- [X] T036 Code review: verify handleRefresh follows same pattern as handleRecarga (consistency)
- [X] T037 Verify TypeScript compiles without errors (npm run build)

**Checkpoint**: All user stories validated, feature ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
    ├─→ Phase 3 (US1 - P1) ← MVP
    ├─→ Phase 4 (US2 - P2) ← Depends on US1
    └─→ Phase 5 (US3 - P3) ← Depends on US1 & US2
    ↓
Phase 6 (Polish)
```

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **This is the MVP**
- **User Story 2 (P2)**: Requires US1 completion (needs button and handleRefresh to exist)
- **User Story 3 (P3)**: Requires US1 & US2 completion (needs button, handler, and loading states)

**Note**: User Stories 2 & 3 are ADDITIVE - they enhance the basic functionality from US1. Each story delivers independent value that can be validated manually.

### Within Each User Story

**User Story 1**:
- T007 (add state) can start immediately after Foundational
- T008 (implement function) can start immediately after Foundational (parallel with T007)
- T009 (add button) MUST wait for T007 & T008 (needs state and function to reference)
- T010-T014 (manual validation) can only start after T009 (button must exist)

**User Story 2**:
- T015, T016, T017 (update button JSX) are modifications to the same JSX block - must be done together or sequentially
- T018-T022 (manual validation) can only start after T015-T017 complete

**User Story 3**:
- T023, T024, T025 (error handling) modify the same handleRefresh function - should be done together
- T026-T030 (manual validation) can only start after T023-T025 complete

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T004, T005, T006 can all run in parallel (different verification tasks)

**Within User Story 1**:
- T007 and T008 can run in parallel (different parts of same file, no conflicts)

**Between User Stories** (if multiple developers):
- Once US1 is complete, US2 and US3 can theoretically start, but US3 depends on US2, so:
  - Developer A: Can start US2 immediately after US1
  - Developer B: Must wait for US2 to start US3

**Within Polish Phase**:
- T031, T032, T033, T034, T036, T037 can all run in parallel (different validation tasks)

---

## Parallel Example: User Story 1 Initial Setup

```bash
# These two tasks can be done simultaneously by the same developer:
Task T007: Add `const [isRefreshing, setIsRefreshing] = useState(false)` to Dashboard.tsx
Task T008: Add `const handleRefresh = async () => { ... }` to Dashboard.tsx

# They modify different parts of the same file and don't conflict
```

---

## Implementation Strategy

### MVP First (Recommended)

1. **Complete Phase 1**: Setup verification (5 min)
2. **Complete Phase 2**: Foundational verification (5 min)
3. **Complete Phase 3**: User Story 1 implementation + validation (20 min)
   - **STOP and VALIDATE**: Manually verify refresh works (all 5 validation scenarios)
   - **DECISION POINT**: Deploy MVP OR continue to next story
4. **Complete Phase 4**: User Story 2 (loading indicators) (10 min)
   - **VALIDATE**: Verify loading states work
5. **Complete Phase 5**: User Story 3 (error handling) (10 min)
   - **VALIDATE**: Verify errors handled silently
6. **Complete Phase 6**: Polish and final validation (10 min)

**Total Estimated Time**: 60 minutes (1 hour)

### Incremental Delivery

Each phase completion represents a shippable increment:

1. **After US1**: Basic refresh functionality - DEPLOYABLE MVP ✅
2. **After US2**: Enhanced with loading indicators - Better UX ✅
3. **After US3**: Production-ready with error handling - Complete feature ✅

### Single Developer Timeline

```
Minutes 0-10:   Phase 1 & 2 (Setup + Foundational verification)
Minutes 10-30:  Phase 3 (User Story 1 implementation)
Minutes 30-35:  Phase 3 validation (US1 manual tests)
--- CHECKPOINT: MVP COMPLETE, CAN STOP HERE ---
Minutes 35-45:  Phase 4 (User Story 2 implementation)
Minutes 45-50:  Phase 4 validation (US2 manual tests)
Minutes 50-60:  Phase 5 (User Story 3 implementation + validation)
Minutes 60-70:  Phase 6 (Polish and final validation)
```

---

## Notes

- **[P] tasks**: Different files or non-conflicting code sections, can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability (US1, US2, US3)
- **Manual validation ONLY**: No automated tests per project policy
- **Validation in browser**: Use DevTools (Console, Network tabs) for all validation
- **Commit strategy**: Commit after each user story phase completion
- **Independent stories**: Each user story should work and be validatable on its own
- **Stop at any checkpoint**: Each checkpoint represents a working, deployable state

---

## Edge Cases Resolution

Based on spec.md edge cases section:

1. **Q**: What happens when user clicks refresh while data is still loading?  
   **A**: Button is disabled during loading (FR-005, T017) - prevents this scenario

2. **Q**: How does system behave if backend returns partial data (only ISPB, no clients)?  
   **A**: Component already handles this - displays available data. No special handling needed for this feature.

3. **Q**: What occurs if cron is disabled and values don't change after multiple refreshes?  
   **A**: Valid scenario - refresh still works, just returns same data. No change needed.

---

## Success Criteria Mapping

Each success criterion maps to specific validation tasks:

- **SC-001** (< 2s response time): T014 validates this
- **SC-002** (< 100ms visual feedback): T018 validates this
- **SC-003** (100% accuracy): T011, T012 validate this
- **SC-004** (clear visual indicator): T018, T019, T020, T021 validate this
- **SC-005** (silent error + retry): T026, T027, T028, T029 validate this

---

## File Impact Summary

**Files Modified**: 1
- `src/frontend/pages/Dashboard.tsx` (add state, function, button JSX)

**Files Created**: 0

**Files Deleted**: 0

**API Changes**: 0 (reuses existing `/bff/dashboard` endpoint)

**Dependencies Added**: 0 (reuses existing react-bootstrap components)

---

## Quick Reference: Task Checklist Format

Every task MUST follow this exact format:

```
✅ CORRECT: - [ ] T001 Create project structure per implementation plan
✅ CORRECT: - [ ] T007 [US1] Add isRefreshing state variable to Dashboard.tsx
✅ CORRECT: - [ ] T015 [US2] Update button to conditionally render Spinner in Dashboard.tsx
❌ WRONG: - [ ] Add state (missing ID, Story label, file path)
❌ WRONG: T001 Create structure (missing checkbox)
❌ WRONG: - [ ] [US1] Add state (missing Task ID)
```

**Format Components**:
1. Checkbox: `- [ ]` (ALWAYS required)
2. Task ID: T### (sequential number)
3. [Story] label: ONLY for user story phases (US1, US2, US3) - NOT for Setup, Foundational, or Polish
4. Description: Clear action with exact file path
