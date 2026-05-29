Continua la implementació de la Kanban Lean App seguint el pla acordat.

## Estat actual del pla (llegir CLAUDE.md per detalls)

**Fase 1 — Baseline** ⬜
- npm install + corregir errors TypeScript
- Verificar docker compose + Prisma migrate

**Fase 2 — Maccion DS** ⬜
- CSS custom properties (tokens Maccion) a `apps/web/app/globals.css`
- Open Sans local a `public/fonts/`
- Layout: nav navy + accent bar + Open Sans
- Aplicar DS a totes les pàgines

**Fase 3 — Backend completions** ⬜
- Modificar `POST /imports/upload` → retorna `needsReview: true` si confidence < 0.85
- Nou `POST /imports/:id/confirm-mapping`
- `GET /kanban/proposals/:id/export-xlsx` (4 fulls)
- Unit tests `kanban-algorithm.spec.ts`

**Fase 4 — Frontend features** ⬜
- Mapping review flow a `/upload`
- Nova pàgina `/articles`
- Columnes Δ + botó export a `/proposals/[id]`

**Fase 5 — QA** ⬜
- Empty states, error states
- Test flux complet end-to-end

## Instruccions

1. Comprova l'estat real del codi (TypeScript errors, fitxers existents).
2. Identifica la primera fase no completada.
3. Treballa fase per fase, marcant cada tasca completada.
4. Usa el TodoWrite tool per fer seguiment del progrés.
5. Aplica sempre el Maccion DS (Navy/Green/Blue, radius 2px, Open Sans).
6. No canviïs l'algorisme Kanban (`kanban-algorithm.ts`) sense consensuar.
