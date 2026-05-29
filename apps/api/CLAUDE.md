# API — NestJS Context

## Estructura de mòduls

```
src/modules/
  imports/
    imports.controller.ts   POST /imports/upload, POST /imports/:id/confirm-mapping, GET /imports
    imports.service.ts      uploadAndNormalize(), confirmMapping(), parseWorkbook()
    imports.module.ts
  claude/
    claude-mapping.service.ts   inferMapping() → MappingResult (tool use + fallback heurístic)
    claude.module.ts
  kanban/
    kanban-algorithm.ts     calculateKanban() — DETERMINISTA, tests unitaris aquí
    kanban.service.ts       generateProposal(), exportProposalXlsx()
    kanban.controller.ts
    kanban.module.ts
  config/
    kanban-config.service.ts   getOrCreateDefault(), create(), update()
    kanban-config.controller.ts
    config.module.ts
  articles/
    articles.controller.ts   GET /articles?search=
    articles.module.ts
prisma/
  prisma.service.ts
  schema.prisma            Models: ImportBatch, Article, ArticleMetric, KanbanConfig, KanbanProposal, KanbanProposalItem
```

## Patró d'imports a NestJS

Cada mòdul importa PrismaService directament (no repositoris intermedis). ClaudeModule és global via `@Global()` — no cal importar-lo als altres mòduls.

## Claude API — restricció important

`ClaudeMappingService` utilitza `@anthropic-ai/sdk` **únicament** per inferir mapeig de columnes Excel. Mai per calcular quantitats Kanban ni per prendre decisions de negoci. Si no hi ha `ANTHROPIC_API_KEY`, fa servir el fallback heurístic (confidence 0.55).

Model configurable via env: `CLAUDE_MODEL=claude-sonnet-4-5` (per defecte).

## Variables d'entorn necessàries

```bash
DATABASE_URL=postgresql://kanban:kanban@localhost:5432/kanban?schema=public
ANTHROPIC_API_KEY=sk-ant-...     # opcional, usa heurística sense ell
CLAUDE_MODEL=claude-sonnet-4-5   # opcional
API_PORT=3001                    # opcional
```

## Prisma patterns

```typescript
// Sempre via PrismaService injectat
await this.prisma.article.upsert({ where: { code }, create: {...}, update: {...} })

// Decimal → number a la capa de servei
Number(m.article.unitCost)

// JSON fields (mappingJson, configSnapshot, summaryJson, diffJson, roundingJson)
// Prisma retorna unknown → cast explícit al servei
```

## Flux d'import (dos passos)

```typescript
// Pas 1: upload
// - Si confidence >= 0.85: status NORMALIZED, retorna { importBatchId, imported, mapping }
// - Si confidence < 0.85:  status MAPPING_INFERRED, retorna { importBatchId, needsReview: true, mapping, warnings }

// Pas 2: confirm-mapping (si needsReview)
// POST /imports/:id/confirm-mapping   body: { fields: { code, description, unitCost, ... } }
// → normalitza les rows amb el mapping confirmat → status NORMALIZED
```

## Excel export (4 fulls)

`GET /kanban/proposals/:id/export-xlsx` retorna un buffer xlsx amb:
1. **Resum** — KPIs globals (total articles, valor Kmax, counts per control type, paràmetres usats)
2. **Taula Kanban** — una fila per article: code, description, unitCost, avgDailyDemand, Kmin, Klot, Kmax, valueAtKmin, valueAtKmax, avgStockUnits, avgStockValue, controlType, rationale
3. **Paràmetres** — snapshot de la config usada
4. **Guia d'usuari** — explicació de les fórmules i tipus de control

Usar la llibreria `xlsx` (ja al package.json).

## Tests

Runner: **Jest** (configurat per NestJS per defecte).

```bash
cd apps/api
npx jest                        # tots els tests
npx jest kanban-algorithm       # només l'algorisme
npx jest --coverage             # amb coverage
```

Fitxer de tests: `src/modules/kanban/kanban-algorithm.spec.ts`
