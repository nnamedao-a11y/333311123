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
- Public: `/` (home), `/vehicles` (catalog), `/vin-check` (VIN search)
- Admin: `/admin/login`, `/admin/dashboard`, etc.

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

### P1 - Calculator Engine (DONE - 27.03.2026)
- [x] CalculatorProfile schema - налаштування профілю
- [x] RouteRate schema - таблиця ставок доставки
- [x] AuctionFeeRule schema - bracket-based auction fees
- [x] Quote schema - збереження розрахунків
- [x] CalculatorEngineService - розрахунок total
- [x] CalculatorAdminService - управління конфігами
- [x] Auto-seed при старті модуля
- [x] Hidden fee логіка (margin control)

### P1 - Lead Conversion Flow (FIXED - 27.03.2026)
- [x] POST /api/public/leads/quick - швидке створення lead
- [x] POST /api/public/leads/from-quote - створення lead з quote
- [x] GET /api/public/leads/status/:id - перевірка статусу lead
- [x] Calculator UI на VIN Check page з калькулятором вартості
- [x] Lead form modal на VIN Check page

### Calculator Features
- Розрахунок повної вартості: car price + auction fee + insurance + shipping + customs + fees
- Admin-configurable: всі ставки міняються через API
- Hidden fee: не показується клієнту, враховується в internal total
- Quote snapshots: зберігання розрахунків для CRM/leads
- Bracket-based auction fees: 9 цінових діапазонів

### APIs (WORKING)
**Public:**
- `POST /api/calculator/calculate` - розрахунок вартості
- `POST /api/calculator/quote` - створення quote
- `GET /api/calculator/quote/:id` - отримання quote
- `GET /api/calculator/ports` - доступні порти та типи авто
- `POST /api/public/leads/quick` - швидке створення lead
- `POST /api/public/leads/from-quote` - lead з quote
- `GET /api/public/leads/status/:id` - статус lead

**Admin:**
- `POST /api/auth/login` - авторизація
- `GET /api/auth/me` - поточний користувач
- `GET /api/calculator/config/profile` - активний профіль
- `PATCH /api/calculator/config/profile` - оновити налаштування
- `GET /api/calculator/config/routes/:profileCode` - route rates
- `POST /api/calculator/config/routes` - upsert rate
- `GET /api/calculator/config/auction-fees/:profileCode` - fee brackets
- `POST /api/calculator/config/auction-fees` - upsert bracket

## Calculator Pricing Structure

### Default Rates (Bulgaria Profile)
**USA Inland Delivery:**
- NJ: $475 (sedan) / $525 (bigSUV)
- GA: $450 / $500
- TX: $550 / $600
- CA: $900 / $1,000

**Ocean Freight:**
- NJ: $525 (sedan) / $700 (SUV) / $800 (bigSUV)
- GA: $500 / $650 / $750
- TX: $600 / $950 / $1,050
- CA: $950 / $1,450 / $1,550

**EU Delivery:** $1,200 (sedan) / $1,400 (SUV) / $1,600 (bigSUV)

**Fixed Fees:**
- Insurance: 2% of (car price + auction fee)
- Customs: 10% of car price
- USA Handling: $150
- Bank Fee: $100
- EU Port Handling: $600
- Company Fee: $940
- Documentation: $50
- Title Fee: $75

**Hidden Fee (margin):**
- Under $5,000: $700
- Over $5,000: $1,400

## Prioritized Backlog

### P1 - High Priority (COMPLETED)
- [x] Calculator UI на VIN page та каталозі
- [x] Lead Conversion Flow (VIN → quote → lead)
- [ ] WebSocket для real-time оновлень таймерів

### P2 - Medium Priority
- [ ] Calculator Admin UI page
- [ ] Quote history в CRM
- [ ] Email notifications
- [ ] Source Health Dashboard UI

### P3 - Low Priority
- [ ] Quote versioning
- [ ] Import presets (premium margin, promo mode)
- [ ] A/B testing для маржі

## Test Credentials
- Admin: `admin@crm.com` / `admin123`

## Recent Fixes (27.03.2026)
1. Added JWT_SECRET to backend .env
2. Fixed Lead validation - added class-validator decorators to DTOs
3. Fixed Lead source enum - mapping to valid LeadSource values
4. Fixed import paths in public-lead.controller.ts and lead.schema.ts

## Next Tasks
1. Create Calculator Admin UI page
2. Implement WebSocket for real-time auction timers
3. Add Quote history view in CRM dashboard
