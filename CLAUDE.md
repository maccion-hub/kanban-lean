# Kanban Lean App — Claude Code Context

## Projecte

Plataforma de dimensionament Lean Kanban per a manteniment industrial. L'usuari puja un Excel d'articles → Claude infereix el mapeig de columnes → càlcul determinista de Kmin/Klot/Kmax per article → propostes versionades. App interna, sense autenticació.

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | Next.js 15.5 · React 19 · App Router |
| Design System | Maccion DS — Navy/Green/Blue, Open Sans, radius 2px |
| API | NestJS 10 · port 3001 |
| DB | PostgreSQL 16 · Prisma ORM |
| AI | Claude API — **únicament** per inferir mapeig de columnes Excel |
| Monorepo | npm workspaces |

## Estructura

```
apps/
  api/src/modules/
    imports/     — upload, inferència mapping, normalització rows
    claude/      — ClaudeMappingService (tool use → MappingResult)
    kanban/      — algorisme + generació propostes + versioning + export xlsx
    config/      — KanbanConfig editable per l'usuari
    articles/    — llistat articles master data
  api/prisma/schema.prisma
  web/app/
    upload/      — formulari + mapping review flow
    articles/    — llistat articles
    config/      — formulari paràmetres Kanban
    kanban/      — generar proposta
    proposals/   — llistat versions + [id] detall amb deltes
packages/shared/ — tipus compartits (CanonicalArticleRow, KanbanResult…)
```

## Comandes essencials

```bash
# Infra (PostgreSQL)
docker compose up -d

# Des del root
npm install
npm run db:migrate          # prisma migrate deploy
npm run dev                 # API :3001 + Web :3000 en paral·lel

# Typecheck (sense compilar)
cd apps/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit

# Tests
cd apps/api && npx jest

# Prisma Studio (UI visual DB)
cd apps/api && npx prisma studio
```

## Maccion Design System — regles OBLIGATÒRIES

- **Navy** `#1B3A5C` — color principal, pes visual 70%
- **Green** `#8DC63F` — CTAs, estats OK, indicadors positius
- **Blue** `#00AEEF` — info, tecnologia, accents secundaris
- `border-radius: 2px` **sempre**. Mai `rounded-lg` ni `rounded-xl`
- Fuente: **Open Sans** (fitxers locals a `apps/web/public/fonts/`)
- Triple accent bar: `.accent-bar` (Green 36px | Navy flex | Blue 36px)

### Classes CSS Maccion (usar aquestes)

```css
/* Fons */
--color-navy: #1B3A5C
--color-green: #8DC63F
--color-blue: #00AEEF
--color-bg: #f6f7f9
--color-card: #ffffff

/* Semàfor */
--status-ok:   #8DC63F
--status-warn: #F59E0B
--status-down: #EF4444
--status-info: #00AEEF
```

## Algorisme Kanban (determinista, no canviar mai sense consensuar)

```
avgDailyDemand = totalConsumption / periodWorkingDays
              | annualRotation / workingDaysPerYear

Kmin  = avgDailyDemand × (leadTimeDays + safetyStockDays)
Klot  = avgDailyDemand × lotCoverageDays
        [cost < lowCostMax → lowCostLotDays=20d]
        [cost < mediumCostMax → mediumCostLotDays=15d]
        [cost ≥ mediumCostMax → highCostLotDays=10d]
Kmax  = Kmin + Klot

Control type:
  unitCost = 0           → COST_ZERO_EXCEPTION
  cost ≥ 50€  o  Kmax valor ≥ 300€  → VALIDATION_REQUIRED
  resta        → PHYSICAL_SIMPLE
```

Arrodoniment: configurable (per defecte ≤5→1, ≤20→5, ≤100→10, ≤500→25, else→50).

## Flux d'import amb mapping review

```
POST /imports/upload
  ↓
Claude infereix mapping (confidence 0–1)
  ├─ confidence ≥ 0.85 → normalitza i persisteix → status NORMALIZED
  └─ confidence < 0.85 → retorna { needsReview: true, importBatchId, mapping }
                            → status MAPPING_INFERRED (no normalitzat)

POST /imports/:id/confirm-mapping   ← usuari corregeix i confirma
  → normalitza i persisteix → status NORMALIZED
```

## Endpoints API principals

```
POST /imports/upload                     — puja Excel
POST /imports/:id/confirm-mapping        — confirma/corregeix mapping
GET  /imports                            — llistat imports
GET  /articles?search=                   — llistat articles

GET  /kanban-configs/default             — configuració per defecte
POST /kanban-configs                     — nova config
PUT  /kanban-configs/:id                 — actualitzar config

POST /kanban/generate                    — genera proposta
GET  /kanban/proposals                   — llistat propostes
GET  /kanban/proposals/:id               — detall + items
GET  /kanban/proposals/:id/export-xlsx   — exporta Excel (4 fulls)
```

## Estat d'implementació

✅ Backend: algorisme, serveis, controllers, Prisma schema, Claude mapping
✅ Versioning i deltes per article (backend)
⬜ Frontend: pàgines bàsiques sense DS, sense mapping review
⬜ `/articles` page: no existeix
⬜ Mapping review flow (frontend)
⬜ Columnes Δ a `/proposals/[id]` (frontend)
⬜ Export xlsx: endpoint (retorna JSON ara)
⬜ Unit tests `kanban-algorithm.ts`

## Convencions de codi

- **TypeScript estricte**: mai `any` explícit — usar tipus correctes o `unknown`
- **NestJS**: Injectable + Prisma, sense repositoris intermedis
- **Next.js**: Server Components per defecte, `'use client'` només quan cal estat/events
- **API URL**: sempre `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'`
- **No `localStorage`**: trenca SSR

## Lo que NO fer

- ❌ `border-radius` > 2px — mai `rounded-lg`, `rounded-xl`, `rounded-full`
- ❌ Modificar l'algorisme Kanban sense consensuar
- ❌ Usar Claude per calcular quantitats Kanban (és determinista)
- ❌ `localStorage` en components React
- ❌ `any` explícit en TypeScript
