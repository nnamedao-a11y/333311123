# BIBI Cars CRM - VIN Intelligence Platform

## Original Problem Statement
CRM система для автобізнесу з:
- VIN Intelligence Engine (парсинг аукціонів Copart/IAAI)
- Публічний UI layer (каталог, VIN перевірка)
- Admin CRM панель (lead management)
- Auction Ranking Engine з live таймерами

## Architecture
- **Frontend**: React.js + Tailwind CSS
- **Backend**: NestJS (TypeScript) via FastAPI proxy
- **Database**: MongoDB
- **Auth**: JWT-based

### URL Structure
- Public: `/` (home), `/vehicles` (catalog), `/vin-check` (VIN search)
- Admin: `/admin/login`, `/admin/dashboard`, etc.

## Core Requirements
1. Публічний сайт для клієнтів (без авторизації)
2. VIN перевірка з даними з аукціонів
3. Каталог авто з таймерами аукціонів
4. Admin CRM для менеджерів

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

### APIs (WORKING)
- `GET /api/auction-ranking/stats` - статистика
- `GET /api/auction-ranking/hot` - гарячі лоти
- `GET /api/auction-ranking/ending-soon` - скоро закінчуються
- `GET /api/auction-ranking/upcoming` - майбутні аукціони
- `GET /api/public/vin/:vin` - публічний VIN пошук

## Prioritized Backlog

### P1 - High Priority
- [ ] WebSocket для real-time оновлень таймерів
- [ ] Cron jobs для автопарсингу Copart/IAAI
- [ ] Source Health Dashboard UI

### P2 - Medium Priority
- [ ] Lead form submission від VIN check
- [ ] Email notifications
- [ ] Auction Event Layer (повні таймери, upcoming)

### P3 - Low Priority
- [ ] Discovery UI в frontend
- [ ] Advanced filtering в каталозі
- [ ] Analytics dashboard

## Test Credentials
- Admin: `admin@crm.com` / `admin123`

## Next Tasks
1. Implement WebSocket для live таймерів
2. Add lead form submission flow
3. Create Source Health Dashboard
