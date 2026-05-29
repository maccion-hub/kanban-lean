# SABEMSA Kanban Lean App

Starter architecture for a Lean Kanban sizing application.

Stack:
- Backend: NestJS
- Frontend: Next.js App Router
- Database: PostgreSQL with Prisma ORM
- AI extraction layer: Claude API for Excel column interpretation

The application imports an Excel file with article code, description, rotation/consumption and unit cost, stores normalized article data in PostgreSQL, lets the user configure Kanban parameters, generates Kanban proposals, and keeps proposal versions with deltas.

## Main flow

1. User uploads Excel file.
2. NestJS parses workbook sheets, headers and sample rows.
3. Backend sends headers and samples to Claude to infer a canonical mapping.
4. User reviews the mapping or the backend applies high-confidence mapping directly.
5. Normalized articles and metrics are upserted in PostgreSQL.
6. User adjusts configuration parameters.
7. Backend generates a Kanban proposal using deterministic formulas.
8. Proposal and item-level results are persisted as a new version if data/config changed.
9. User compares proposal versions.

## Kanban algorithm

For each article:

- Average daily demand:
  - If the Excel provides period consumption: totalConsumption / periodWorkingDays
  - If the Excel provides annual rotation: annualRotation / workingDaysPerYear

- Kmin:
  - Kmin = avgDailyDemand * (leadTimeDays + safetyStockDays)

- Klot:
  - Klot = avgDailyDemand * lotCoverageDays
  - lotCoverageDays is selected by unit cost tier

- Kmax:
  - Kmax = Kmin + Klot

All quantities are rounded up using a configurable practical rounding rule.

## Default parameters based on the consulting model

- leadTimeDays: 2
- safetyStockDays: 5
- kminCoverageDays: 7
- low price tier: unitCost < 1 EUR -> 20 days lot coverage
- medium price tier: 1 EUR <= unitCost < 10 EUR -> 15 days lot coverage
- high price tier: unitCost >= 10 EUR -> 10 days lot coverage
- cost 0 articles: allowed as exception, reviewed separately

## Run locally

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npm run db:migrate
npm run dev
```

API: http://localhost:3001
Web: http://localhost:3000

## Important implementation notes

- Claude is used only to infer column mapping and normalize ambiguous headers, not to calculate Kanban. Kanban sizing is deterministic.
- Every proposal stores a snapshot of the configuration and source import.
- Versioning is based on a hash of source data and configuration.
- Articles with unitCost = 0 are kept as exceptions and clearly flagged.
