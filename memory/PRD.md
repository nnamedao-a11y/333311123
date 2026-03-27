# BIBI Cars CRM - VIN Intelligence Platform

## Project Summary
Full-stack CRM system for auto business with VIN Intelligence, Calculator Engine, Quote Management, Manager Price Override system, and **Quote Analytics Dashboard**.

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
- Dynamic pricing based on:
  - Car price
  - Port of origin
  - Vehicle type
  - Destination country
- Configurable fees: auction, insurance, customs, shipping, company fee
- Hidden fee (margin control) system

### Scenario Pricing System ✅
- Three pricing scenarios:
  - Minimum: -5% from visible total
  - Recommended: base visible price
  - Aggressive: +10% from visible total
- Quote creation with scenario selection

### Manager Price Override + Audit ✅
- Manager can override final price with reason
- Full audit trail recorded
- Impact on margin calculated
- Analytics by manager:
  - Total overrides
  - Average price change %
  - Margin impact

### Quote History System ✅
- All calculations saved as quotes
- Linked to leads and customers
- Scenario selection per quote
- Audit history per quote

### Quote Analytics Dashboard ✅ (NEW - 2026-03-27)
Business intelligence dashboard for quote/revenue analysis:

**KPI Metrics:**
- Total Quotes
- Quote → Lead Conversion Rate
- Estimated Margin (Hidden Fee total)
- Visible Revenue
- Total Hidden Fee
- Lost Revenue (from overrides)

**Scenario Performance:**
- Conversion rate per scenario (minimum/recommended/aggressive)
- Average price and margin per scenario
- Visual progress bars

**Manager Performance:**
- Quotes count per manager
- Conversion rate
- Average margin
- Total margin
- Override count and rate
- Revenue lost by overrides
- Manager name resolution from User collection

**Source Performance:**
- Quotes by source (vin/manual/admin/manager)
- Conversion rates
- Revenue and margin by source

**Timeline Analysis:**
- 30-day quote/margin trend
- Area charts with Recharts

**Lost Revenue Analysis:**
- Top price overrides with highest losses
- Original vs override price delta

### CRM Features ✅
- Leads management with VIN linking
- Customers database
- Deals tracking
- Task management
- Staff/team management
- Documents

### Admin Features ✅
- Calculator configuration
- Route rates management
- Auction fee rules
- Pricing profiles

## User Personas
1. **Master Admin**: Full access, calculator config, analytics
2. **Manager**: Quote creation, price override, lead management
3. **Sales**: Lead follow-up, quote generation

## API Endpoints (Key)

### Quote Analytics (NEW)
- `GET /api/admin/quote-analytics` - Full dashboard data
- `GET /api/admin/quote-analytics/overview` - KPI summary
- `GET /api/admin/quote-analytics/scenarios` - Scenario performance
- `GET /api/admin/quote-analytics/managers` - Manager performance
- `GET /api/admin/quote-analytics/sources` - Source performance
- `GET /api/admin/quote-analytics/timeline` - Timeline data
- `GET /api/admin/quote-analytics/lost-revenue` - Lost revenue analysis

### Calculator
- `POST /api/calculator/calculate` - Calculate delivery cost
- `POST /api/calculator/quote` - Create quote with scenarios
- `PATCH /api/calculator/quote/:id/scenario` - Set scenario
- `PATCH /api/calculator/quote/:id/override` - Manager price override
- `GET /api/calculator/quote/:id/audit` - Get audit history
- `GET /api/calculator/admin/manager-analytics` - Override analytics

### Leads
- `POST /api/public/leads/from-quote` - Create lead from quote
- `POST /api/public/leads/quick` - Quick lead creation

## Test Credentials
- Admin: admin@crm.com / admin123

## Test VINs (seeded)
- WBA3B3C50EF123456: 2014 BMW 328i ($8,500)
- WVWZZZ3CZWE123789: 2019 VW Tiguan ($15,500)
- JN1TANT31U0000001: 2020 Nissan Rogue ($18,000)
- 1HGCV1F34KA000001: 2019 Honda Accord ($12,500)
- 5YJSA1E29KF000001: 2019 Tesla Model S ($35,000)

## What's Been Implemented
- [x] Calculator Engine with configurable fees
- [x] Scenario Pricing (min/rec/max)
- [x] Quote History System
- [x] Manager Price Override with Audit
- [x] VIN Intelligence integration
- [x] Lead conversion from quotes
- [x] CRM Admin panel with navigation
- [x] Test data seeding
- [x] **Quote Analytics Dashboard** (2026-03-27)

## Prioritized Backlog

### P0 (Critical)
- ✅ Manager Price Override + Audit
- ✅ Quote Analytics Dashboard

### P1 (High)
- [ ] Pricing Profiles (A/B testing different margin strategies)
- [ ] WebSocket for real-time timers
- [ ] Manager Performance Dashboard (detailed view)

### P2 (Medium)
- [ ] SMS/Email notifications
- [ ] Export reports to Excel
- [ ] Mobile responsive improvements

### P3 (Nice to have)
- [ ] Quick Quote widget
- [ ] Automated follow-up reminders
- [ ] AI pricing recommendations

## Next Tasks
1. **Pricing Profiles** - Switch between Standard/Premium/Promo margin profiles
2. **Auto-optimization** - System suggests optimal scenario based on historical data
3. **Quote Analytics on VIN/Make/Model level** - drill-down analysis

---
Last Updated: 2026-03-27
