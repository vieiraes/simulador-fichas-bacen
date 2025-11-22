# Quickstart: Botão de Refresh no Dashboard

**Feature**: 001-adicionar-botao-refresh-dashboard  
**Date**: 2025-11-22  
**Estimated Time**: 30 minutes

## Prerequisites

- Node.js installed
- Project dependencies installed (`npm install`)
- Basic familiarity with React and TypeScript

---

## What You're Building

A refresh button on the Dashboard page that:
- Fetches latest bucket data from `/bff/dashboard` endpoint
- Shows spinner + "Atualizando..." text while loading
- Updates all bucket displays without page reload
- Handles errors silently (no popups or alerts)

**User Story**: Users can see updated bucket values from the background cron worker without manually refreshing the entire page.

---

## Architecture Overview

```
User clicks "Atualizar" button
        ↓
Dashboard.tsx (handleRefresh)
        ↓
apiService.getDashboard()
        ↓
GET /bff/dashboard
        ↓
Returns { clients: [], ispb: {} }
        ↓
Dashboard state updated
        ↓
UI re-renders with new values
```

**Key Files**:
- `src/frontend/pages/Dashboard.tsx` - Component to modify
- `src/frontend/services/api.ts` - API service (no changes)
- `src/bff/controllers/Dashboard.controller.ts` - BFF endpoint (no changes)

---

## Implementation Steps

### Step 1: Add Refresh State (5 min)

**Location**: `src/frontend/pages/Dashboard.tsx`

**Current state variables**:
```typescript
const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

**Add new state**:
```typescript
const [isRefreshing, setIsRefreshing] = useState(false)
```

**Why separate state?**:
- `loading` is for initial page load
- `isRefreshing` is for user-triggered refresh
- Allows button to show different text/spinner

---

### Step 2: Create Refresh Handler (10 min)

**Add this function** in Dashboard component, after the existing `handleRecarga` function:

```typescript
const handleRefresh = async () => {
  try {
    setIsRefreshing(true)
    const data = await apiService.getDashboard()
    setDashboardData(data)
    // Silent success - no notification
  } catch (err) {
    // Silent error - just log to console
    console.error('Error refreshing dashboard:', err)
  } finally {
    setIsRefreshing(false)
  }
}
```

**Key points**:
- Uses existing `apiService.getDashboard()` method
- Sets `isRefreshing` before API call (enables loading UI)
- Updates `dashboardData` on success
- Logs errors to console only (no user-facing errors)
- Resets `isRefreshing` in finally block (always runs)

---

### Step 3: Add Refresh Button (10 min)

**Find this section** in Dashboard.tsx (around line 66):

```tsx
<div className="d-flex justify-content-between align-items-center mb-4">
  <h1>Dashboard de Buckets</h1>
  <Button 
    variant="primary" 
    onClick={handleRecarga}
    disabled={loading}
  >
    {/* ... existing button code ... */}
  </Button>
</div>
```

**Add new button** next to existing one:

```tsx
<div className="d-flex justify-content-between align-items-center mb-4">
  <h1>Dashboard de Buckets</h1>
  <div className="d-flex gap-2">
    <Button 
      variant="outline-primary" 
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      {isRefreshing ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />{' '}
          Atualizando...
        </>
      ) : (
        'Atualizar'
      )}
    </Button>
    <Button 
      variant="primary" 
      onClick={handleRecarga}
      disabled={loading}
    >
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />{' '}
          Recarregando...
        </>
      ) : (
        'Recarregar Buckets'
      )}
    </Button>
  </div>
</div>
```

**Why two buttons?**:
- "Atualizar" = Refresh current data (just view update)
- "Recarregar Buckets" = Force bucket recarga (triggers backend action)
- Different use cases, both useful

**Button styling**:
- `outline-primary` = Less prominent (secondary action)
- `gap-2` = Bootstrap spacing between buttons
- `disabled={isRefreshing}` = Prevents double-clicks

---

### Step 4: Remove Error Alert for Refresh (5 min)

**Current code shows error Alert** for all errors:

```tsx
if (error) {
  return <Alert variant="danger">{error}</Alert>
}
```

**Note**: This error state is NOT set by our refresh handler (we handle errors silently). The existing error handling is for initial page load, which is separate. **No changes needed here** - our refresh errors are already silent.

---

## Manual Validation

### Test 1: Basic Refresh (P1 - User Story 1)

1. Start the application:
   ```bash
   npm start
   ```

2. Open browser: `http://localhost:3000`

3. Note the current bucket values (e.g., ISPB: 300, Client 1: 52)

4. Wait 2 minutes for cron to run (watch console logs)

5. Click "Atualizar" button

6. **Expected**:
   - Button shows "Atualizando..." + spinner
   - Button is disabled during request
   - Bucket values update to new values
   - Button returns to "Atualizar" when done
   - No page reload

7. **Success Criteria**: Values update in < 2 seconds

---

### Test 2: Loading Indicator (P2 - User Story 2)

1. Open browser console (F12) → Network tab

2. Throttle network to "Slow 3G"

3. Click "Atualizar" button

4. **Expected**:
   - Spinner appears immediately (< 100ms)
   - Text changes to "Atualizando..."
   - Button is disabled (clicking has no effect)
   - Request completes after ~3-5 seconds
   - Button returns to normal

---

### Test 3: Error Handling (P3 - User Story 3)

1. Open browser console (F12) → Console tab

2. Open Network tab → Set to "Offline"

3. Click "Atualizar" button

4. **Expected**:
   - Button shows loading state
   - Request fails (network error)
   - Error logged in console: "Error refreshing dashboard: ..."
   - Button returns to "Atualizar" (NO alert shown)
   - Button can be clicked again immediately

5. Restore network → Click button again

6. **Expected**: Refresh works normally

---

### Test 4: Rapid Clicks

1. Click "Atualizar" button 5 times rapidly

2. **Expected**:
   - Only ONE request sent (button disabled after first click)
   - Spinner shows until request completes
   - No duplicate requests in Network tab

---

### Test 5: Responsive Design

1. Open browser DevTools → Toggle device toolbar

2. Test on:
   - Mobile (375px): iPhone SE
   - Tablet (768px): iPad
   - Desktop (1440px): Standard monitor

3. **Expected**:
   - Button visible and clickable on all sizes
   - Text readable without zoom
   - Button not cut off or overlapping

---

## Common Issues & Solutions

### Issue: Button doesn't show spinner

**Cause**: State not updating

**Solution**: Check `setIsRefreshing(true)` is called before API call

**Debug**: Add `console.log('isRefreshing:', isRefreshing)` in render

---

### Issue: Data doesn't update

**Cause**: `setDashboardData` not called

**Solution**: Ensure `const data = await apiService.getDashboard()` succeeds

**Debug**: Add `console.log('New data:', data)` after API call

---

### Issue: Error alert appears

**Cause**: Initial load error (separate from refresh)

**Solution**: This is expected behavior for initial load failures

**Note**: Refresh errors are silent (logged to console only)

---

### Issue: Button stays disabled

**Cause**: `setIsRefreshing(false)` not called

**Solution**: Ensure `finally` block always runs

**Debug**: Check console for unhandled promise rejections

---

## Performance Check

**Target**: < 2 seconds from button click to UI update

**Measure**:
1. Open DevTools → Network tab
2. Click "Atualizar" button
3. Find `bff/dashboard` request
4. Check "Time" column

**Expected**: 50-200ms (local simulator, no external APIs)

**If slower**: Check if backend/worker are running, check for console errors

---

## Code Quality Checklist

Before considering done:

- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Button shows correct text: "Atualizar" / "Atualizando..."
- [ ] Spinner visible during loading
- [ ] Button disabled during loading
- [ ] Errors logged to console (not shown to user)
- [ ] No duplicate API requests possible
- [ ] Code follows existing Dashboard.tsx patterns
- [ ] Variable names descriptive (`isRefreshing` not `loading2`)
- [ ] Function names descriptive (`handleRefresh` not `refresh`)

---

## Next Steps

After implementation and validation:

1. **Commit changes**:
   ```bash
   git add src/frontend/pages/Dashboard.tsx
   git commit -m "feat: add refresh button to dashboard

   - Add refresh button to fetch latest bucket data
   - Show spinner + text change during loading
   - Handle errors silently per spec
   - Reuse existing /bff/dashboard endpoint
   
   Closes #1"
   ```

2. **Manual validation**: Test all 5 scenarios above

3. **Update documentation**: Add button description to README.md if needed

4. **Demo**: Show stakeholders the refresh functionality

---

## Architecture Decisions

### Why not replace "Recarregar Buckets" button?

**Decision**: Keep both buttons

**Rationale**: 
- Different use cases (view refresh vs trigger action)
- Users may want to force recarga AND view updates
- Removing existing functionality breaks current workflows

---

### Why separate loading states?

**Decision**: `loading` for initial, `isRefreshing` for refresh

**Rationale**:
- Different UI behaviors (full page spinner vs button spinner)
- Independent actions (can happen simultaneously)
- Clearer code intent

---

### Why silent error handling?

**Decision**: No alerts/toasts, only console logging

**Rationale**: Per spec clarification (Session 2025-11-22):
- "Botão será clicado múltiplas vezes"
- "Sem necessidade de feedback de erro"
- User can retry immediately without dismissing errors

---

## Summary

**Lines of Code**: ~30 (1 state variable, 1 function, 1 button JSX)

**Files Changed**: 1 (`Dashboard.tsx`)

**API Changes**: 0

**Dependencies Added**: 0

**Testing**: Manual validation in browser (5 test scenarios)

**Estimated Time**: 30 minutes implementation + 15 minutes testing

---

## Need Help?

**Common questions**:

1. **Where is `apiService`?**  
   Already imported at top of Dashboard.tsx: `import apiService from '../services/api'`

2. **What is `Spinner` component?**  
   Bootstrap component, already imported: `import { Card, Row, Col, Button, Spinner, Alert } from 'react-bootstrap'`

3. **Do I need to modify BFF?**  
   No, `/bff/dashboard` endpoint already exists and works

4. **Should I write tests?**  
   No, this project uses manual validation only (NO TESTING POLICY)

5. **Can I use different button text?**  
   No, spec requires "Atualizar" → "Atualizando..." per clarification
