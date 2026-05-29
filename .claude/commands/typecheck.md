Executa TypeScript type-check sense compilar en les dues apps:

1. `cd apps/api && npx tsc --noEmit` — verifica l'API NestJS
2. `cd apps/web && npx tsc --noEmit` — verifica el frontend Next.js

Mostra tots els errors per app. Si no hi ha errors, confirma-ho clarament.
Si hi ha errors, agrupa'ls per fitxer i explica breument la causa de cada un.
No arreglis els errors a menys que l'usuari ho demani explícitament.
