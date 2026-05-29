Executa els tests unitaris de l'API NestJS:

```bash
cd apps/api && npx jest --passWithNoTests
```

Si el fitxer `src/modules/kanban/kanban-algorithm.spec.ts` no existeix, avisa que els tests de l'algorisme estan pendents d'implementar (és una tasca pendent del pla d'implementació).

Mostra el resum de tests passats/fallats i el coverage si és disponible.
Si algun test falla, mostra el missatge d'error complet.
