# Claude Code implementation prompt

You are implementing a production-ready Lean Kanban sizing platform for an industrial maintenance company.

Use this repository scaffold as the baseline. Complete the application with these requirements:

## Business objective

The user uploads an Excel file with article code, description, rotation/consumption and unit cost. The platform synchronizes article master data into PostgreSQL, allows Lean parameter configuration, generates Kanban proposals with Kmin, Klot and Kmax per article, and keeps proposal versions when data/config changes.

## Stack

- Backend: NestJS
- Frontend: Next.js App Router
- DB: PostgreSQL through Prisma
- AI: Claude API for Excel column mapping only

## Functional requirements

### Import and synchronization

1. Accept .xlsx and .xls files.
2. Parse sheet names, headers and sample rows.
3. Send headers and sample rows to Claude to infer canonical mapping:
   - code
   - description
   - unitCost
   - currentStock optional
   - totalConsumption optional
   - annualRotation optional
   - packaging optional
4. Review mapping if confidence < 0.85.
5. Apply mapping deterministically to all rows.
6. Upsert Article records by code.
7. Create ArticleMetric records linked to the ImportBatch.
8. Keep raw import metadata, file hash and mapping JSON.

### Configuration

Allow the user to edit and version:

- workingDaysPerYear
- leadTimeDays
- safetyStockDays
- lowCostMax
- mediumCostMax
- lowCostLotDays
- mediumCostLotDays
- highCostLotDays
- validationUnitCostMin
- validationKmaxValueMin
- practical rounding rules

### Kanban proposal generation

Implement deterministic calculation:

avgDailyDemand:
- if totalConsumption and periodWorkingDays exist: totalConsumption / periodWorkingDays
- else if annualRotation exists: annualRotation / workingDaysPerYear

Kmin raw:
- avgDailyDemand * (leadTimeDays + safetyStockDays)

Klot raw:
- avgDailyDemand * selectedLotCoverageDays

Lot coverage days:
- unitCost < lowCostMax: lowCostLotDays
- lowCostMax <= unitCost < mediumCostMax: mediumCostLotDays
- unitCost >= mediumCostMax: highCostLotDays

Rounding:
- Use configurable round-up rules.
- Default: <=5 round to 1, <=20 to 5, <=100 to 10, <=500 to 25, otherwise to 50.

Kmax:
- Kmin + Klot

Control type:
- unitCost = 0: COST_ZERO_EXCEPTION
- unitCost >= validationUnitCostMin or Kmax value >= validationKmaxValueMin: VALIDATION_REQUIRED
- otherwise: PHYSICAL_SIMPLE

Calculate values:
- valueAtKmin = Kmin * unitCost
- valueAtKmax = Kmax * unitCost
- averageStockUnits = Kmin + Klot / 2
- averageStockValue = averageStockUnits * unitCost

### Versioning

1. Generate sourceHash from import hash + config snapshot + calculated item results.
2. If sourceHash exists, return unchanged = true.
3. Else create a new proposal version.
4. Store item-level deltas from previous proposal:
   - kminDelta
   - klotDelta
   - kmaxDelta
   - unitCostDelta
   - avgDailyDemandDelta
   - newItem/deletedItem

### UI pages

- Dashboard
- Excel upload and mapping review
- Article list
- Configuration form
- Generate proposal
- Proposal versions list
- Proposal detail table
- Proposal comparison view
- Export proposal to Excel

## Acceptance criteria

- App starts with docker compose and npm scripts.
- User can upload the sample Excel.
- Articles are persisted in PostgreSQL.
- A Kanban proposal is generated and stored.
- Re-running with same data/config does not create duplicate proposal.
- Changing config creates a new proposal version.
- The proposal detail table includes the same fields as the consulting Excel: summary, parameters, Kanban table and user guide.
- Unit tests cover the Kanban algorithm.

## First implementation tasks

1. Run npm install and fix TypeScript compile errors.
2. Implement mapping review flow in frontend.
3. Add Excel export endpoint using xlsx.
4. Add unit tests for kanban-algorithm.ts.
5. Improve validation and error handling.
6. Add authentication if required by deployment.
