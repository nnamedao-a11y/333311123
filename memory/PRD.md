# BIBI Cars CRM - VIN Intelligence Platform

## Project Summary
Full-stack CRM system for auto business with VIN Intelligence, Calculator Engine, Quote Management, Manager Price Override, Quote Analytics Dashboard, and **Full Deals Pipeline**.

## Architecture
- **Backend**: NestJS (TypeScript) + FastAPI proxy
- **Frontend**: React.js + Tailwind CSS
- **Database**: MongoDB
- **Auth**: JWT-based authentication

## Core Features Implemented

### VIN Intelligence Engine ✅
- Multi-source VIN lookup (Copart, IAAI)
- Vehicle data aggregation
- Price and history tracking

### Calculator Engine ✅
- Dynamic pricing based on car price, port, vehicle type, destination
- Configurable fees: auction, insurance, customs, shipping, company fee
- Hidden fee (margin control) system

### Scenario Pricing System ✅
- Three pricing scenarios: Minimum (-5%), Recommended, Aggressive (+10%)
- Quote creation with scenario selection

### Manager Price Override + Audit ✅
- Manager can override final price with reason
- Full audit trail recorded
- Impact on margin calculated

### Quote History System ✅
- All calculations saved as quotes
- Linked to leads and customers
- Scenario selection per quote

### Quote Analytics Dashboard ✅ (2026-03-27)
- KPI metrics: Total Quotes, Conversion %, Margin, Revenue, Hidden Fee, Lost Revenue
- Scenario Performance with conversion rates
- Manager Performance table with override tracking
- Source Performance analytics
- Timeline charts (30-day trend)
- Lost Revenue Analysis

### Deals System v2.0 ✅ (2026-03-27) **NEW**
Full sales pipeline: **QUOTE → LEAD → DEAL → DEPOSIT → PROFIT**

**Status Pipeline:**
- `new` → `negotiation` → `waiting_deposit` → `deposit_paid` → `purchased` → `in_delivery` → `completed`
- Status transition validation
- `cancelled` option at any stage

**Financial Tracking:**
- `clientPrice` - ціна для клієнта
- `internalCost` - внутрішня собівартість
- `purchasePrice` - ціна покупки на аукціоні
- `estimatedMargin` - очікуваний прибуток (з quote)
- `realCost` / `realRevenue` - реальні витрати/дохід
- `realProfit` - **фактичний прибуток**

**Pipeline Links:**
- `quoteId` - зв'язок з quote (сценарій, маржа)
- `leadId` - зв'язок з lead
- `depositId` - зв'язок з депозитом
- `vin` - VIN авто

**Override Tracking:**
- `overrideApplied` - чи був override
- `overrideDelta` - втрата від override

**Pipeline Analytics:**
- Funnel: Quotes → Leads → Deals → Completed
- Conversion rates
- Manager performance по deals
- Scenario performance (real profit)

### CRM Features ✅
- Leads management with VIN linking
- Customers database
- Task management
- Staff/team management
- Documents

## API Endpoints (Deals v2.0)

### Deals Pipeline
- `POST /api/deals` - Create deal manually
- `POST /api/deals/from-lead` - **Create deal from lead + quote**
- `GET /api/deals` - List all deals
- `GET /api/deals/:id` - Get deal by ID
- `GET /api/deals/lead/:leadId` - Get deal by lead ID
- `PUT /api/deals/:id` - Update deal
- `PATCH /api/deals/:id/status` - **Update status with transition validation**
- `PATCH /api/deals/:id/finance` - **Update financial data (real cost/revenue)**
- `PATCH /api/deals/:id/bind-deposit` - Bind deposit to deal
- `DELETE /api/deals/:id` - Delete deal

### Deals Analytics
- `GET /api/deals/stats` - Aggregated statistics
- `GET /api/deals/pipeline-analytics` - **Full funnel analytics**

## Test Results (Latest)
```
Backend:  100% (15/15 tests passed)
Frontend: 85% (core functionality working)

Pipeline Test:
- Created deal from lead + quote ✅
- Status transitions validated ✅
- Financial updates working ✅
- Real Profit calculated: $2000 ✅
- Completion rate: 100% ✅
```

## Test Credentials
- Admin: admin@crm.com / admin123

## What's Been Implemented
- [x] Calculator Engine with configurable fees
- [x] Scenario Pricing (min/rec/max)
- [x] Quote History System
- [x] Manager Price Override with Audit
- [x] VIN Intelligence integration
- [x] Lead conversion from quotes
- [x] Quote Analytics Dashboard
- [x] **Deals System v2.0 with full pipeline** (2026-03-27)

## Prioritized Backlog

### P0 (Critical) - DONE ✅
- ✅ Manager Price Override + Audit
- ✅ Quote Analytics Dashboard
- ✅ Deals Pipeline (QUOTE → LEAD → DEAL → PROFIT)

### P1 (High)
- [ ] Customer 360 (timeline, full history)
- [ ] Pricing Profiles (A/B testing different margin strategies)
- [ ] Deposit Management integration with deals

### P2 (Medium)
- [ ] SMS/Email notifications
- [ ] Export reports to Excel
- [ ] Mobile responsive improvements

### P3 (Nice to have)
- [ ] Quick Quote widget
- [ ] Automated follow-up reminders
- [ ] AI pricing recommendations

## Next Tasks
1. **Customer 360** - повна картина клієнта: leads + quotes + deals + timeline
2. **Deposit Management** - інтеграція депозитів з deals pipeline
3. **Auto-optimization** - система пропонує оптимальний сценарій

---
Last Updated: 2026-03-27
