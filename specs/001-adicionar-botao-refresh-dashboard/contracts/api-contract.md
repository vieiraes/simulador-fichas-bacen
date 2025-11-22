# API Contract: Dashboard Refresh

**Feature**: 001-adicionar-botao-refresh-dashboard  
**Date**: 2025-11-22

## Overview

This feature does NOT introduce new API endpoints. It reuses the existing BFF endpoint for dashboard data retrieval. This document serves as reference for the frontend implementation.

---

## Existing Endpoint Used

### GET /bff/dashboard

**Purpose**: Retrieve current state of all buckets (ISPB and clients)

**Endpoint**: `GET /bff/dashboard`

**Source**: `src/bff/controllers/Dashboard.controller.ts`

**Backend Implementation**: Fetches from `/balde/saldos` internal API

---

## Request Specification

### HTTP Method
```
GET
```

### URL
```
http://localhost:3000/bff/dashboard
```

### Headers
```
Accept: application/json
```

### Query Parameters
None

### Request Body
None

---

## Response Specification

### Success Response (200 OK)

**Status Code**: 200

**Content-Type**: `application/json`

**Response Body**:
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

**Schema**:
```typescript
{
  clients: Array<{
    id: string        // UUID format
    balde: number     // 0-100 integer
  }>
  ispb: {
    ISPB: string      // Bank identifier (numeric string)
    balde: number     // 0-300 integer
  }
}
```

**Field Descriptions**:
- `clients` (array, required): List of all client wallets with their current bucket states
  - `id` (string, required): Unique identifier for the client wallet
  - `balde` (number, required): Current number of fichas in the client's bucket (max 100)
- `ispb` (object, required): ISPB bucket state
  - `ISPB` (string, required): Bank identifier code
  - `balde` (number, required): Current number of fichas in ISPB bucket (max 300)

---

### Error Response (500 Internal Server Error)

**Status Code**: 500

**Content-Type**: `application/json`

**Response Body**:
```json
{
  "message": "Erro ao buscar dados do dashboard"
}
```

**Schema**:
```typescript
{
  message: string
}
```

**When This Occurs**:
- Internal backend API (`/balde/saldos`) is unreachable
- Backend API returns non-2xx status code
- Network connectivity issues between BFF and backend

---

## Frontend Integration

### API Service Method (Existing)

Location: `src/frontend/services/api.ts`

```typescript
const getDashboard = async (): Promise<DashboardData> => {
  const response = await axios.get(`${API_BASE_URL}/bff/dashboard`)
  return response.data
}
```

**Notes**:
- Method already exists, no modifications needed
- Returns typed `DashboardData` object
- Throws error on non-2xx response (axios default behavior)

---

### Component Usage Pattern

**In Dashboard Component**:

```typescript
const handleRefresh = async () => {
  try {
    setIsRefreshing(true)
    const data = await apiService.getDashboard()
    setDashboardData(data)
    // Silent success - no user notification
  } catch (error) {
    console.error('Refresh error:', error)
    // Silent error handling - no user notification per spec
  } finally {
    setIsRefreshing(false)
  }
}
```

---

## Contract Validation Rules

### Request Validation
- N/A (no request body or parameters)

### Response Validation (Handled by TypeScript)
- `clients` must be array (TypeScript enforces)
- `ispb` must be object (TypeScript enforces)
- Each client must have `id` and `balde` properties
- ISPB must have `ISPB` and `balde` properties

### Error Handling
- Network errors: Caught by try-catch, logged to console
- 500 errors: Caught by try-catch, logged to console
- No user-facing error messages (silent failure per spec)

---

## Performance Characteristics

**Expected Response Time**: < 500ms (local simulation, no external APIs)

**Payload Size**: ~500 bytes (3 clients + 1 ISPB)

**Caching**: None (always fetch fresh data to reflect cron updates)

**Rate Limiting**: None (button disabled during request prevents spam)

---

## Security Considerations

**Authentication**: None required (local simulator)

**Authorization**: None required (single-user tool)

**Data Sensitivity**: Low (simulated data, no real financial information)

**CORS**: Not applicable (same-origin requests)

---

## Testing Strategy

**Manual Testing via Browser**:
1. Open dashboard at `http://localhost:3000`
2. Click "Atualizar" button
3. Observe network tab: GET request to `/bff/dashboard`
4. Verify response matches schema above
5. Confirm UI updates with new data

**Manual Testing via curl**:
```bash
curl -X GET http://localhost:3000/bff/dashboard \
  -H "Accept: application/json"
```

**Expected Output**: JSON matching success response schema

---

## Change Log

**v1.0** (2025-11-22):
- Initial documentation
- No API changes (documenting existing endpoint)
- Contract confirmed stable since project inception

---

## Summary

**API Changes**: NONE  
**New Endpoints**: 0  
**Modified Endpoints**: 0  
**Breaking Changes**: NONE

This feature is a pure consumer of existing, stable API infrastructure. No backend coordination required.
