# BIBI Cars CRM - VIN Intelligence Platform

## Original Problem Statement
CRM система для автобізнесу з повним Revenue Pipeline:
VIN → Calculator → Quote → Lead → Deal → $

## Architecture
- **Frontend**: React.js + Tailwind CSS
- **Backend**: NestJS (TypeScript) via FastAPI proxy
- **Database**: MongoDB
- **Auth**: JWT-based

## What's Implemented

### P0 - Core Features (DONE)
- VIN Intelligence Engine - multi-source aggregation
- Source Registry Module - data source management
- Auto-optimization engine - weight updates
- Auction Ranking Engine

### P1 - UI Layer (DONE)
- Public Pages: Home, Vehicles, VIN Check
- Admin CRM: Dashboard, Leads, Customers, Deals, etc.
- Calculator Admin UI

### 🔥 MONETIZATION FLOW (DONE)
```
VIN Search → Calculator → Quote Snapshot → Lead → CRM
```

### 🔥 CALCULATOR ADMIN UI (DONE)
- Profile Settings (all fees editable)
- Hidden Fees (Margin Control)
- Rate Tables (USA Inland, Ocean, EU Delivery)
- Auction Fee Rules
- Live Preview with visible/internal totals

### 🔥 QUOTE HISTORY SYSTEM (DONE - 27.03.2026)

**Quote Schema Extended:**
```typescript
scenarios: {
  minimum: number;      // -5%
  recommended: number;  // base
  aggressive: number;   // +10%
}
selectedScenario: 'minimum' | 'recommended' | 'aggressive';
finalPrice: number;
createdFrom: 'vin' | 'manual' | 'admin' | 'manager';
convertedToLead: boolean;
history: Array<{
  action: string;
  timestamp: Date;
  oldValue?: any;
  newValue?: any;
}>
```

**Features:**
- [x] 3 Scenario Pricing: Minimum (-5%), Recommended, Aggressive (+10%)
- [x] Quote history per lead/VIN
- [x] Scenario selection in VIN Check page
- [x] Scenario change API with audit trail
- [x] Quote History button in CRM Leads
- [x] Quote History modal with full breakdown
- [x] History tracking (audit trail)

### APIs

**Public:**
- `POST /api/calculator/calculate` - calculate
- `POST /api/calculator/quote` - create with scenarios
- `GET /api/calculator/quote/:id` - get quote
- `PATCH /api/calculator/quote/:id/scenario` - change scenario
- `GET /api/calculator/quotes?vin=&leadId=` - history

**Admin:**
- Full Calculator Admin CRUD
- Quote management
- Statistics

## Scenario Pricing System

**Example (car $20,000):**
```
Minimum:     $26,684 (-5%)  → High conversion
Recommended: $28,089        → Balanced
Aggressive:  $30,897 (+10%) → Max profit
```

**Business Value:**
- Manager flexibility in negotiations
- Conversion analytics per scenario
- Profit optimization
- Audit trail for all changes

## Prioritized Backlog

### COMPLETED ✅
- [x] VIN Intelligence Engine
- [x] Calculator Engine
- [x] Monetization Flow
- [x] Calculator Admin UI
- [x] Quote History System
- [x] Scenario Pricing

### P2 - Next Steps
- [ ] Manager Price Override with Audit
- [ ] Pricing Profiles (A/B testing)
- [ ] WebSocket for real-time timers
- [ ] Quote analytics dashboard

### P3 - Future
- [ ] Quote versioning
- [ ] SEO VIN pages
- [ ] Email notifications

## Test Credentials
- Admin: `admin@crm.com` / `admin123`

## Recent Updates (27.03.2026)
1. ✅ Quote History System
2. ✅ Scenario Pricing (minimum/recommended/aggressive)
3. ✅ Audit trail for quote changes
4. ✅ Quote History in CRM Leads
5. ✅ Scenario selection in VIN Check page
