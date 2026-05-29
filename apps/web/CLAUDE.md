# Web — Next.js Context

## Pàgines (App Router)

```
app/
  page.tsx              Dashboard — 3 passos, KPIs globals si hi ha dades
  layout.tsx            Nav navy + accent bar + Open Sans
  upload/page.tsx       Formulari pujada Excel + mapping review flow
  articles/page.tsx     Llistat articles amb search (Server Component)
  config/page.tsx       Formulari paràmetres Kanban (Client)
  kanban/page.tsx       Generar proposta + summary cards (Client)
  proposals/
    page.tsx            Llistat versions (Server Component)
    [id]/page.tsx       Detall proposta: taula amb Δ + botó export xlsx
  globals.css           CSS custom properties Maccion DS + Open Sans
```

## Maccion DS — aplicació pràctica

```css
/* Custom properties definides a globals.css */
var(--color-navy)    /* #1B3A5C — nav, headers, accents principals */
var(--color-green)   /* #8DC63F — botons CTA, badges ok */
var(--color-blue)    /* #00AEEF — info, links */
var(--color-bg)      /* #f6f7f9 — fons pàgina */
var(--color-card)    /* #ffffff — cards */

/* border-radius SEMPRE 2px — mai més */
border-radius: 2px;

/* Accent bar al header */
<div class="accent-bar"></div>  /* Green 36px | Navy flex | Blue 36px */
```

## Server vs Client Components

**Server Component** (per defecte, sense directiva):
- Pàgines que fan `fetch` directe a l'API sense interacció d'usuari
- Llistat de proposals, llistat d'articles

**Client Component** (`'use client'` al top):
- Formularis amb `useState`, `useEffect`
- Upload, Config, Kanban generate
- Mapping review (interacció per corregir columnes)

## Crida a l'API

```typescript
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Server Component
const data = await fetch(`${API}/kanban/proposals`, { cache: 'no-store' }).then(r => r.json());

// Client Component
const res = await fetch(`${API}/imports/upload`, { method: 'POST', body: formData });
```

## Mapping Review Flow

```
1. POST /imports/upload → si needsReview === true:
   → mostra <MappingReviewTable> amb les columnes detectades
   → cada camp té un <select> amb totes les capçaleres del Excel
   → botó "Confirmar mapping"

2. POST /imports/:importBatchId/confirm-mapping → { fields: { code, description, unitCost, ... } }
   → si ok: mostra resum import (n articles sincronitzats)
   → si error: mostra missatge
```

## Columnes delta a Proposal Detail

Per cada article a la taula `proposals/[id]`:
- `diffJson.newItem === true` → badge "Nou" (green)
- `diffJson.deletedItem === true` → badge "Eliminat" (red)
- `diffJson.kminDelta`, `klotDelta`, `kmaxDelta` → `+N` en verd / `-N` en vermell / `—` si 0

## Export Excel

Botó a `proposals/[id]/page.tsx`:
```typescript
// Descàrrega directa via link
<a href={`${API}/kanban/proposals/${id}/export-xlsx`} download>
  Exportar Excel
</a>
```

## Variables d'entorn

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Restriccions

- ❌ `localStorage` — trenca SSR (Next.js standalone)
- ❌ `border-radius` > 2px
- ❌ Google Fonts — Open Sans és local a `public/fonts/`
