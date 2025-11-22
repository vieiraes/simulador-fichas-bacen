# Data Model: Botão de Refresh no Dashboard

**Feature**: 001-adicionar-botao-refresh-dashboard  
**Date**: 2025-11-22

## Entity Definitions

### Existing Entities (No Changes)

These entities are already defined in the codebase and will be reused without modification:

#### Wallet
Represents a client's bucket state.

**Fields**:
- `id: string` - Unique identifier for the wallet (UUID format)
- `balde: number` - Current number of fichas/tokens in the bucket (0-100)

**Validation Rules**:
- `id` must be a valid UUID string
- `balde` must be non-negative integer, max 100 per BACEN rules

**Relationships**:
- Part of `DashboardData.clients` array
- Displayed in Dashboard UI as client bucket cards

**Source**: `src/frontend/pages/Dashboard.tsx` (interface Wallet)

---

#### ISPB
Represents the ISPB (bank) bucket state.

**Fields**:
- `ISPB: string` - Bank identifier code
- `balde: number` - Current number of fichas in ISPB bucket (0-300)

**Validation Rules**:
- `ISPB` must be numeric string (e.g., "03311443")
- `balde` must be non-negative integer, max 300 per BACEN rules

**Relationships**:
- Part of `DashboardData` object
- Displayed in Dashboard UI as ISPB bucket card

**Source**: `src/frontend/pages/Dashboard.tsx` (interface ISPB)

---

#### DashboardData
Aggregates all bucket information for dashboard display.

**Fields**:
- `clients: Wallet[]` - Array of client wallet objects
- `ispb: ISPB` - ISPB bucket object

**Validation Rules**:
- `clients` array must not be empty
- `ispb` must be present (required field)

**Relationships**:
- Returned by `/bff/dashboard` endpoint
- Consumed by Dashboard component for rendering
- Updated when refresh button is clicked

**Source**: `src/frontend/pages/Dashboard.tsx` (interface DashboardData)

---

## New State Entities

These are component-level state variables to be added for the refresh feature:

### RefreshLoadingState
Internal React state to track refresh operation status.

**Type**: `boolean`

**Purpose**: Controls visual feedback during refresh operation

**State Transitions**:
```
Initial: false (button shows "Atualizar")
  ↓ User clicks refresh button
Loading: true (button shows "Atualizando..." + spinner, disabled)
  ↓ API call completes (success or error)
Complete: false (button returns to "Atualizar", enabled)
```

**Implementation**:
```typescript
const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
```

**Usage**:
- Conditionally render button text and spinner
- Disable button during refresh to prevent duplicate calls
- Reset on API success or error (silent failure)

**Rationale**: Separate from existing `loading` state to distinguish between initial page load and user-triggered refresh.

---

## Data Flow Diagram

```
User Action: Click "Atualizar" button
       ↓
[handleRefresh() function]
       ↓
Set isRefreshing = true
       ↓
[apiService.getDashboard()]
       ↓
HTTP GET /bff/dashboard
       ↓
      ╱  ╲
   Success  Error
     ↓       ↓
Update      Log to
dashboardData  console
     ↓       ↓
     ╲       ╱
      ╲     ╱
Set isRefreshing = false
       ↓
UI updates (button enabled)
```

---

## API Contract (Existing - No Changes)

### Endpoint: GET /bff/dashboard

**Request**:
```
GET /bff/dashboard
Headers: None required
Body: None
```

**Success Response** (200 OK):
```json
{
  "clients": [
    {
      "id": "469834d9-61b0-4893-81c1-94418f300e0a",
      "balde": 100
    },
    {
      "id": "d2dde215-98d8-43be-954f-384ed8c3de4c",
      "balde": 52
    },
    {
      "id": "cf82633d-71f9-4ff0-ab3e-7a8163d3fc06",
      "balde": 100
    }
  ],
  "ispb": {
    "ISPB": "03311443",
    "balde": 300
  }
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "message": "Erro ao buscar dados do dashboard"
}
```

**Frontend Handling**:
- Success: Update `dashboardData` state, reset loading
- Error: Log to console, reset loading (no user-facing error per spec)

---

## Component State Diagram

```
Dashboard Component State Machine:

┌─────────────────┐
│  Initial Load   │
│  loading=true   │
│  data=null      │
└────────┬────────┘
         │ useEffect fires
         │ getDashboard()
         ↓
┌─────────────────┐
│   Data Loaded   │◄─────┐
│  loading=false  │      │
│  data=present   │      │
└────────┬────────┘      │
         │               │
         │ User clicks   │
         │ refresh       │
         ↓               │
┌─────────────────┐      │
│   Refreshing    │      │
│isRefreshing=true│      │
│  button disabled│      │
└────────┬────────┘      │
         │               │
         │ API response  │
         └───────────────┘
```

---

## Type Definitions Summary

**No New Types Needed** - All types already exist:

```typescript
// Existing in src/frontend/pages/Dashboard.tsx
interface Wallet {
  id: string
  balde: number
}

interface ISPB {
  ISPB: string
  balde: number
}

interface DashboardData {
  clients: Wallet[]
  ispb: ISPB
}

// Only new state variable (boolean, built-in type)
const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
```

---

## Validation Strategy

### Data Validation (Existing)
- Backend validates data before sending to BFF
- BFF validates response from backend
- Frontend receives pre-validated data

### State Validation
- `isRefreshing` state is boolean - no validation needed
- `dashboardData` type-checked by TypeScript
- Null checks already present in component: `if (!dashboardData)`

### User Input Validation
- N/A - No user input fields, only button click

---

## Summary

**Entities Modified**: 0  
**Entities Added**: 1 component state variable (`isRefreshing: boolean`)  
**API Changes**: 0 (reuse existing `/bff/dashboard`)  
**Type Definitions**: 0 new (reuse existing `DashboardData`, `Wallet`, `ISPB`)

This feature is purely presentational with minimal state management. All data structures already exist and are proven to work. The only new entity is a boolean flag for tracking refresh operations.
