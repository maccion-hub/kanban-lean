Inicia l'entorn de desenvolupament complet en aquest ordre:

1. Comprova que Docker és accessible (`docker info`). Si no ho és, avisa l'usuari.
2. Executa `docker compose up -d` al root del projecte. Espera que PostgreSQL estigui healthy.
3. Executa `npm run db:migrate` al root per aplicar migracions Prisma pendents.
4. Executa `npm run dev` al root per arrencar API (:3001) i Web (:3000) en paral·lel.

Mostra l'estat final: quins serveis estan running i les URLs accessibles.
Si algun pas falla, para i explica exactament quin pas ha fallat i per què.
