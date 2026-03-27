# BIBI Cars CRM - VIN Intelligence Engine PRD

## Original Problem Statement
CRM система для автобізнесу (BIBI Cars) з парсером аукціонів (Copart/IAAI) та VIN Intelligence Engine для 100% coverage.

## Architecture

### Tech Stack
- **Backend:** NestJS + TypeScript + MongoDB
- **Frontend:** React + Tailwind CSS + Phosphor Icons
- **Database:** MongoDB
- **Theme:** Light (matching admin panel UI)

### Core Modules

#### 1. VIN Engine Module (`/modules/vin-engine/`)
- `search.provider.ts` - пошук через DuckDuckGo
- `url-filter.service.ts` - фільтрація та пріоритизація URL
- `extractor.service.ts` - витягування даних зі сторінок
- `vin-merge.service.ts` - об'єднання результатів
- `vin-cache.service.ts` - кешування (TTL 7 днів)
- `vin-search.service.ts` - головний VIN search service
- `vin-search-orchestrator.service.ts` - координація multi-source пошуку

#### 2. Source Registry Module (`/modules/source-registry/`)
- `source.schema.ts` - MongoDB модель з auto-optimization полями
- `source-registry.service.ts` - керування джерелами
- `source-registry.controller.ts` - Admin API endpoints
- `source-optimization.service.ts` - автоматична оптимізація ваг
- `source-optimization.cron.ts` - scheduled tasks

#### 3. Source Discovery Module (`/modules/source-discovery/`)
- `discovered-source.schema.ts` - MongoDB модель для знайдених джерел
- `source-discovery.service.ts` - автоматичний пошук нових джерел
- `source-onboarding.service.ts` - promotion джерел до registry
- `source-discovery.cron.ts` - scheduled tasks
- `source-discovery.controller.ts` - Admin API

#### 4. Competitor Parsing Module (`/modules/competitor-parsing/`) - NEW
- `competitor.config.ts` - конфігурація 7 джерел конкурентів
- `competitor-parser.service.ts` - smart HTML extraction з cheerio
- `competitor-runner.service.ts` - orchestration з rate limiting
- `competitor-parsing.controller.ts` - Admin API для тестування

#### 5. Pipeline Module (`/modules/pipeline/`)
- Нормалізація, дедуплікація, мердж, скоринг

#### 6. Ingestion Module (`/modules/ingestion/`)
- Parser runners (Copart, IAAI)
- Antiblock system

## Implemented Features

### 2026-03-27

#### Auto-Optimization Engine ✅
- [x] `manualWeight` - вага встановлена адміном (0-1)
- [x] `systemScore` - автоматично вирахувана оцінка (0.1-1)
- [x] `effectiveWeight = manualWeight * systemScore`
- [x] Health scoring (excellent/good/fair/poor/critical)
- [x] Auto-disable для джерел з дуже низьким success rate
- [x] Auto-enable для джерел що відновились
- [x] Cron job кожні 15 хв для recompute

#### Source Discovery Module ✅
- [x] Автоматичне відкриття нових джерел під час VIN search
- [x] Аналіз якості джерел (vinCoverageScore, reliabilityScore)
- [x] Кандидати на promotion (minReliability >= 0.6, minCheckCount >= 3)
- [x] Auto-promotion cron кожну годину
- [x] Admin API для керування discovery
- [x] Інтеграція з VIN orchestrator

#### Competitor Parsing Layer ✅
- [x] 7 competitor sources (bidfax, poctra, statvin, autobidmaster, salvagebid, iaai, copart)
- [x] Smart HTML extraction з cheerio
- [x] Rate limiting (2-5 секунд між запитами)
- [x] Parallel execution з batching
- [x] Integration в VIN Orchestrator
- [x] Admin API для тестування (`POST /api/admin/competitors/test/:vin`)

### Competitor Sources
| Name | Display Name | Priority | Rate Limit |
|------|--------------|----------|------------|
| bidfax | BidFax | 10 | 2000ms |
| poctra | Poctra | 11 | 2000ms |
| statvin | Stat.VIN | 12 | 2500ms |
| autobidmaster | AutoBidMaster | 20 | 3000ms |
| salvagebid | SalvageBid | 21 | 3000ms |
| iaai | IAAI | 5 | 5000ms |
| copart | Copart | 5 | 5000ms |

### VIN Search Flow
```
VIN
→ Database (local_db)
→ Cache check
→ Aggregators (parallel)
→ Competitors - Deep Parse (parallel via CompetitorRunner)
→ Web Search (DuckDuckGo)
→ Source Discovery (background)
→ Extract & Parse
→ Merge candidates
→ Score & Rank
→ Return result
```

## API Endpoints

### Source Registry (Admin)
```
GET    /api/admin/sources              - список всіх джерел
GET    /api/admin/sources/enabled      - тільки активні
GET    /api/admin/sources/report       - optimization report
PATCH  /api/admin/sources/:name/toggle - вкл/викл
PATCH  /api/admin/sources/:name/weight - змінити вагу
POST   /api/admin/sources/:name/reset-stats - скинути статистику
POST   /api/admin/sources/recompute    - примусова оптимізація
POST   /api/admin/sources/:name/auto-enable - force enable
```

### Source Discovery (Admin)
```
GET    /api/admin/discovery            - список discovered sources
GET    /api/admin/discovery/stats      - статистика
GET    /api/admin/discovery/candidates - кандидати на promotion
POST   /api/admin/discovery/promote    - запустити promotion
POST   /api/admin/discovery/:domain/force-promote - force promote
```

### Competitor Parsing (Admin)
```
GET    /api/admin/competitors          - список джерел конкурентів
POST   /api/admin/competitors/test/:vin - тест parsing для VIN
POST   /api/admin/competitors/test/:vin/:source - тест конкретного джерела
```

### VIN Search (Authenticated)
```
GET    /api/vin/search?vin=XXX        - пошук VIN
GET    /api/vin/:vin                   - пошук за параметром
GET    /api/vin/admin/cache-stats      - статистика кешу
```

## Test Results (2026-03-27)
- Backend: 85%
- Frontend: 100% (login, dashboard, VIN search working)
- Overall: 92%

## Credentials
- Admin: admin@crm.com / admin123
- API: https://repo-setup-52.preview.emergentagent.com

## Backlog

### P0 (Critical) - COMPLETED ✅
- [x] VIN Intelligence Engine
- [x] Source Registry Module
- [x] Admin control for sources
- [x] Light theme UI
- [x] Auto-optimization engine
- [x] Source Discovery Module
- [x] Competitor Parsing Layer

### P1 (High Priority)
- [ ] Auction Event Layer (таймери, upcoming auctions)
- [ ] WebSocket real-time updates
- [ ] Cron jobs для автопарсингу Copart/IAAI

### P2 (Medium)
- [ ] Source health dashboard UI
- [ ] Email notifications для critical sources
- [ ] Export to CSV/Excel
- [ ] Discovery UI в frontend

### P3 (Nice to have)
- [ ] API rate limiting
- [ ] Analytics dashboard
- [ ] Multi-tenant support

## Next Steps
1. Auction Event Layer - таймери та upcoming auctions
2. WebSocket для real-time статусу
3. Frontend UI для Source Discovery
