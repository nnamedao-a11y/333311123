# BIBI Cars CRM - VIN Intelligence Platform

## Original Problem Statement
CRM система для автобізнесу з:
- VIN Intelligence Engine (парсинг аукціонів Copart/IAAI)
- Публічний UI layer (каталог, VIN перевірка)
- Admin CRM панель (lead management)
- Auction Ranking Engine з live таймерами
- Calculator Engine (pricing engine для доставки)

## Architecture
- **Frontend**: React.js + Tailwind CSS
- **Backend**: NestJS (TypeScript) via FastAPI proxy
- **Database**: MongoDB
- **Auth**: JWT-based

### URL Structure
**Public:**
- `/` - Home page (hero, stats, hot auctions)
- `/vehicles` - Vehicle catalog with filters
- `/vin-check` - VIN search & calculator

**Admin CRM:**
- `/admin/login` - Auth
- `/admin` - Dashboard
- `/admin/leads` - Lead management
- `/admin/calculator` - **NEW** Calculator Admin Panel

## What's Implemented (27.03.2026)

### P0 - Core Features (DONE)
- [x] VIN Intelligence Engine - пошук по VIN з агрегацією джерел
- [x] Source Registry Module - управління джерелами даних
- [x] Auto-optimization engine - автоматичне оновлення ваг джерел
- [x] Source Discovery Module - виявлення нових джерел
- [x] Competitor Parsing Layer - парсинг 7+ джерел
- [x] Auction Ranking Engine - ранжування лотів за score

### P1 - UI Layer (DONE)
- [x] Public Home Page - hero, stats, hot auctions, ending soon
- [x] Public Vehicles Catalog - фільтри, пошук, карточки авто
- [x] Public VIN Check Page - пошук VIN з результатами
- [x] Vehicle Cards з таймерами аукціонів
- [x] Admin Login/Dashboard
- [x] Розділення public/admin routing

### P1 - Calculator Engine (DONE)
- [x] CalculatorProfile schema - налаштування профілю
- [x] RouteRate schema - таблиця ставок доставки
- [x] AuctionFeeRule schema - bracket-based auction fees
- [x] Quote schema - збереження розрахунків
- [x] CalculatorEngineService - розрахунок total
- [x] CalculatorAdminService - управління конфігами
- [x] Auto-seed при старті модуля
- [x] Hidden fee логіка (margin control)

### 🔥 MONETIZATION FLOW (DONE)
```
VIN Search → Calculator → Quote Snapshot → Lead → CRM
```
- [x] Calculator UI на VIN Check page
- [x] Quote creation з visible та internal totals
- [x] Lead from Quote conversion
- [x] **MARGIN CONTROL**: Менеджер бачить внутрішню ціну + hidden fee
- [x] CRM Leads table з "Ціна клієнта" та "Внутрішня ціна"

### 🔥 CALCULATOR ADMIN UI (DONE - 27.03.2026)
**Revenue Engine Control Panel**

**Features:**
- [x] Stats Dashboard: total quotes, quoted value, profiles
- [x] Profile Settings: all fees editable without code
- [x] Hidden Fees (Margin Control): threshold, under/over values
- [x] USA Inland Rates table with CRUD
- [x] Ocean Rates table with CRUD
- [x] EU Delivery Rates table with CRUD
- [x] Auction Fee Rules table with brackets editing
- [x] Live Preview: test calculations with current settings
- [x] Dual view: Client (visible) vs Manager (internal) totals

**Admin can edit:**
- Insurance Rate (%)
- USA Handling Fee ($)
- Bank Fee ($)
- EU Port Handling ($)
- Company Fee ($)
- Customs Rate (%)
- Documentation Fee ($)
- Title Fee ($)
- Hidden Fee Threshold ($)
- Hidden Fee Under/Over Threshold ($)
- All route rates by port and vehicle type
- All auction fee brackets

### APIs (WORKING)
**Public:**
- `GET /api/public/vin/:vin` - VIN search
- `POST /api/calculator/calculate` - calculate cost
- `POST /api/calculator/quote` - create quote
- `POST /api/public/leads/quick` - quick lead
- `POST /api/public/leads/from-quote` - lead from quote

**Calculator Admin:**
- `GET /api/calculator/config/profile` - active profile
- `PATCH /api/calculator/config/profile` - update profile
- `GET /api/calculator/config/routes/:code` - route rates
- `POST /api/calculator/config/routes` - upsert rate
- `DELETE /api/calculator/config/routes/:id` - delete rate
- `GET /api/calculator/config/auction-fees/:code` - auction rules
- `POST /api/calculator/config/auction-fees` - upsert rule
- `DELETE /api/calculator/config/auction-fees/:id` - delete rule
- `GET /api/calculator/admin/stats` - statistics

## Calculator Pricing Structure

### Default Rates (Bulgaria Profile)
**USA Inland:** NJ $475-$525, GA $450-$500, TX $550-$600, CA $900-$1000

**Ocean Freight:** 
- NJ: $525 (sedan) - $800 (bigSUV)
- CA: $950 (sedan) - $1550 (bigSUV)

**EU Delivery:** $1200-$1600 by vehicle type

**Fixed Fees:**
- Insurance: 2%
- Customs: 10%
- USA Handling: $150
- Bank Fee: $100
- EU Port Handling: $600
- Company Fee: $940
- Documentation: $50
- Title Fee: $75

**Hidden Fee (Margin):**
- Under $5,000: $700
- Over $5,000: $1,400

## Prioritized Backlog

### COMPLETED ✅
- [x] VIN Intelligence Engine
- [x] Calculator Engine
- [x] Monetization Flow
- [x] Calculator Admin UI

### P2 - Next Steps
- [ ] Quote History in CRM
- [ ] Pricing Profiles (A/B testing)
- [ ] Manager Price Override with Audit
- [ ] WebSocket for real-time timers
- [ ] Email notifications

### P3 - Future
- [ ] Quote versioning
- [ ] Import presets (premium, promo)
- [ ] SEO VIN pages

## Test Credentials
- Admin: `admin@crm.com` / `admin123`
- Role: `master_admin` (full access to Calculator Admin)

## Recent Updates (27.03.2026)
1. ✅ Implemented Monetization Flow
2. ✅ Added margin control system
3. ✅ Updated CRM Leads with dual pricing
4. ✅ Created Calculator Admin UI
5. ✅ Added Live Preview with visible/internal totals
