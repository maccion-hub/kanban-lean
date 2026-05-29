# User stories – Aplicació Kanban Lean SABEMSA

## Objectiu del document

Aquest document defineix les user stories de l’aplicació Kanban Lean perquè Claude Code pugui preparar un pla d’implementació incremental.

L’aplicació té com a objectiu importar un Excel d’articles, interpretar-ne les columnes, persistir dades en PostgreSQL, configurar paràmetres Kanban, generar propostes de Kmin, Klot i Kmax, versionar les propostes i facilitar-ne la revisió per part de l’usuari.

## Arquitectura objectiu

- Backend: NestJS
- Frontend: Next.js
- Base de dades: PostgreSQL
- ORM: Prisma
- Interpretació d’Excel: Claude API per mapatge semàntic de columnes
- Càlcul Kanban: motor determinista dins del backend
- Importació Excel: parser Excel al backend
- Versionat: hash de dades d’entrada + configuració + resultats

## Rols principals

### Administrador funcional
Usuari responsable de configurar paràmetres Kanban, validar mapatges i aprovar propostes.

### Usuari operatiu
Usuari que consulta propostes, descarrega resultats i aplica el Kanban al magatzem.

### Sistema
Components automàtics de backend, integracions, càlculs, versionat i persistència.

---

# Èpica 1 – Inicialització tècnica i entorn

## US-001 – Inicialitzar entorn local de desenvolupament

**Com a** desenvolupador  
**Vull** poder aixecar l’aplicació completa en local  
**Per tal de** desenvolupar, provar i validar funcionalitats de forma autònoma.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
- El projecte arrenca amb `docker-compose up`.
- PostgreSQL queda disponible.
- El backend NestJS arrenca sense errors.
- El frontend Next.js arrenca sense errors.
- Prisma pot connectar amb la base de dades.
- Existeix un `.env.example` amb totes les variables necessàries.
- El README explica els passos d’instal·lació i execució.

### Notes tècniques
- Validar versions de Node.js, pnpm/npm i PostgreSQL.
- Afegir scripts:
  - `dev`
  - `db:migrate`
  - `db:seed`
  - `test`
  - `lint`
  - `format`

---

## US-002 – Definir model de dades inicial

**Com a** arquitecte de software  
**Vull** disposar d’un model de dades Prisma complet  
**Per tal de** persistir articles, imports, configuracions, propostes i versions.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
- Existeixen models Prisma per:
  - `Article`
  - `ArticleMetric`
  - `ImportBatch`
  - `KanbanConfig`
  - `KanbanProposal`
  - `KanbanProposalItem`
- `Article.code` és únic.
- `ArticleMetric` queda vinculat a un article i a un import.
- `KanbanProposal` queda vinculat a una configuració i a un import.
- `KanbanProposalItem` guarda Kmin, Klot, Kmax i justificació.
- Les migracions Prisma s’executen correctament.

### Notes tècniques
Incloure camps mínims:
- codi article
- descripció
- cost unitari
- consum total període
- rotació anual
- consum mitjà diari
- estoc actual
- origen de dades
- hash de versió
- timestamps

---

# Èpica 2 – Importació i sincronització d’Excel

## US-003 – Carregar un Excel des del frontend

**Com a** usuari administrador  
**Vull** carregar un fitxer Excel amb articles  
**Per tal de** sincronitzar la llista d’articles de l’aplicació.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
- Existeix una pantalla `/upload`.
- L’usuari pot seleccionar un fitxer `.xlsx`.
- El frontend envia el fitxer al backend via multipart/form-data.
- El backend valida extensió i mida màxima.
- Es mostra missatge d’error si el fitxer no és vàlid.
- Es mostra l’estat de càrrega mentre dura el procés.

### Notes tècniques
Endpoint suggerit:
- `POST /imports/upload`

---

## US-004 – Llegir estructura de l’Excel

**Com a** sistema  
**Vull** llegir fulls, capçaleres i files de mostra de l’Excel  
**Per tal de** preparar la interpretació semàntica de les dades.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
- El backend detecta tots els fulls del fitxer.
- El backend extreu capçaleres de cada full.
- El backend extreu una mostra configurable de files.
- El backend ignora files completament buides.
- Es registra un `ImportBatch` amb estat `PENDING_MAPPING`.
- Es conserva el nom del fitxer i hash del fitxer.

### Notes tècniques
- Utilitzar una llibreria tipus `xlsx`.
- Guardar metadades, no necessàriament el fitxer complet en aquesta fase.
- Cal preparar estructura JSON per enviar a Claude.

---

## US-005 – Interpretar columnes amb Claude API

**Com a** sistema  
**Vull** enviar a Claude les capçaleres i mostres de l’Excel  
**Per tal de** obtenir un mapatge entre columnes origen i camps de PostgreSQL.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
- El backend envia a Claude:
  - nom dels fulls
  - capçaleres
  - files de mostra
  - esquema objectiu esperat
- Claude retorna JSON estructurat.
- El JSON inclou:
  - full recomanat
  - columna de codi
  - columna de descripció
  - columna de cost unitari
  - columna de consum o rotació
  - columna d’estoc, si existeix
  - confiança del mapatge
  - observacions
- El backend valida el JSON abans de guardar-lo.
- Si Claude no pot mapar una columna crítica, l’import queda en estat `NEEDS_REVIEW`.

### Notes tècniques
El càlcul Kanban no s’ha de delegar a Claude. Claude només interpreta l’estructura variable de l’Excel.

---

## US-006 – Revisar i validar el mapatge de columnes

**Com a** administrador funcional  
**Vull** revisar el mapatge proposat per Claude  
**Per tal de** confirmar o corregir quines columnes alimenten cada camp.

### Prioritat
MVP – Alta

### Criteris d’acceptació
- Existeix una pantalla de revisió del mapatge.
- Es mostra el full seleccionat.
- Es mostren les columnes detectades.
- Es mostra el mapatge proposat.
- L’usuari pot canviar una columna assignada.
- L’usuari pot confirmar el mapatge.
- El mapatge confirmat queda guardat a `ImportBatch`.

### Notes tècniques
Ruta suggerida:
- `/upload/[importId]/mapping`

---

## US-007 – Sincronitzar articles a PostgreSQL

**Com a** sistema  
**Vull** aplicar el mapatge validat a totes les files de l’Excel  
**Per tal de** crear o actualitzar articles i mètriques.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
- Si l’article no existeix, es crea.
- Si l’article ja existeix, s’actualitza la informació bàsica.
- Es crea un `ArticleMetric` per a cada article importat.
- Es normalitzen imports monetaris i decimals.
- Es normalitzen quantitats.
- Es generen errors de fila quan falten dades obligatòries.
- L’import finalitza amb estat `COMPLETED` o `COMPLETED_WITH_WARNINGS`.
- Es mostra resum:
  - articles creats
  - articles actualitzats
  - files ignorades
  - errors detectats

### Notes tècniques
- La sincronització ha de ser idempotent per `Article.code`.
- Guardar errors de fila en JSON dins d’`ImportBatch` o taula específica.

---

# Èpica 3 – Configuració Kanban

## US-008 – Crear configuració Kanban per defecte

**Com a** sistema  
**Vull** disposar d’una configuració inicial Kanban  
**Per tal de** poder generar una proposta sense configuració manual prèvia.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
- Existeix una configuració activa per defecte.
- Els valors inicials són:
  - dies laborables anuals: 220
  - lead time: 2 dies
  - stock de seguretat: 5 dies
  - Klot per articles < 1 €: 20 dies
  - Klot per articles entre 1 € i 10 €: 15 dies
  - Klot per articles >= 10 €: 10 dies
  - llindar cost unitari control especial: 50 €
  - llindar valor Kmax control especial: 300 €
- La configuració queda versionada.

### Notes tècniques
- Afegir seed inicial.

---

## US-009 – Editar paràmetres Kanban

**Com a** administrador funcional  
**Vull** editar els paràmetres de càlcul Kanban  
**Per tal de** adaptar el model a la realitat del magatzem.

### Prioritat
MVP – Alta

### Criteris d’acceptació
- Existeix pantalla `/config`.
- L’usuari pot editar:
  - dies laborables anuals
  - lead time
  - dies de seguretat
  - dies Klot per tram de cost
  - llindar cost unitari per control especial
  - llindar valor Kmax per control especial
  - regles de rodoniment
- Es validen valors negatius o incoherents.
- Guardar una configuració crea una nova versió.
- Només una configuració pot quedar activa.

### Notes tècniques
- No sobreescriure configuracions anteriors.
- Les propostes Kanban han de referenciar la configuració utilitzada.

---

# Èpica 4 – Motor de càlcul Kanban

## US-010 – Calcular consum mitjà diari

**Com a** sistema  
**Vull** calcular el consum mitjà diari de cada article  
**Per tal de** dimensionar Kmin, Klot i Kmax.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
- Si l’Excel porta consum total del període:
  - `consumMitjaDiari = consumTotal / diesLaborablesPeriode`
- Si l’Excel porta rotació anual:
  - `consumMitjaDiari = rotacioAnual / diesLaborablesAnuals`
- Si no hi ha consum ni rotació, l’article queda exclòs de l’ABC/Kanban principal.
- El càlcul queda testejat unitàriament.

### Notes tècniques
- Permetre que l’usuari indiqui període de consum si l’Excel no el porta explícit.
- Preparar camp `sourceMetricType`.

---

## US-011 – Calcular Kmin

**Com a** sistema  
**Vull** calcular el punt de reposició Kmin  
**Per tal de** indicar quan cal reposar un article.

### Prioritat
MVP – Crítica

### Fórmula
`Kmin = consumMitjaDiari × (leadTimeDies + diesSeguretat)`

### Criteris d’acceptació
- El sistema calcula Kmin brut.
- El sistema calcula Kmin arrodonit.
- Kmin mai és negatiu.
- Si hi ha consum positiu, Kmin mínim és com a mínim 1 unitat abans d’arrodonir.
- La justificació explica lead time i stock de seguretat.
- El càlcul queda testejat.

---

## US-012 – Calcular Klot

**Com a** sistema  
**Vull** calcular el lot de reposició Klot  
**Per tal de** determinar quantes unitats cal reposar quan s’activa el Kanban.

### Prioritat
MVP – Crítica

### Fórmula
`Klot = consumMitjaDiari × diesCoberturaLot`

### Criteris d’acceptació
- Si cost unitari < 1 €, aplicar cobertura de tram baix.
- Si cost unitari >= 1 € i < 10 €, aplicar cobertura de tram mitjà.
- Si cost unitari >= 10 €, aplicar cobertura de tram alt.
- Si cost unitari = 0, aplicar regla d’excepció i marcar article com `COST_ZERO_EXCEPTION`.
- El sistema calcula Klot brut i Klot arrodonit.
- La justificació indica el tram de cost aplicat.
- El càlcul queda testejat.

---

## US-013 – Calcular Kmax

**Com a** sistema  
**Vull** calcular l’estoc màxim Kmax  
**Per tal de** saber el nivell objectiu després de reposar.

### Prioritat
MVP – Crítica

### Fórmula
`Kmax = Kmin + Klot`

### Criteris d’acceptació
- Kmax utilitza valors arrodonits de Kmin i Klot.
- Kmax sempre és superior o igual a Kmin.
- Es calcula valor econòmic a Kmin i Kmax.
- Es calcula estoc mitjà estimat.
- Es calcula valor d’estoc mitjà estimat.
- El càlcul queda testejat.

---

## US-014 – Aplicar rodoniment pràctic

**Com a** sistema  
**Vull** arrodonir els resultats a quantitats pràctiques  
**Per tal de** facilitar la implantació física al magatzem.

### Prioritat
MVP – Alta

### Criteris d’acceptació
- Existeix una funció de rodoniment configurable.
- Regla per defecte:
  - fins a 5: múltiple d’1
  - fins a 20: múltiple de 5
  - fins a 100: múltiple de 10
  - fins a 500: múltiple de 25
  - més de 500: múltiple de 50
- Sempre s’arrodoneix cap amunt.
- La regla aplicada queda guardada a cada proposta.
- El càlcul queda testejat.

---

## US-015 – Classificar tipus de control Kanban

**Com a** sistema  
**Vull** classificar cada article segons el tipus de control  
**Per tal de** diferenciar Kanban físic simple, control especial i excepcions.

### Prioritat
MVP – Alta

### Criteris d’acceptació
- Si cost unitari = 0, tipus = `EXCEPCIO_COST_0`.
- Si cost unitari >= llindar especial, tipus = `CONTROL_ESPECIAL`.
- Si valor a Kmax >= llindar especial, tipus = `CONTROL_ESPECIAL`.
- En la resta de casos, tipus = `KANBAN_FISIC_SIMPLE`.
- La justificació explica la classificació.
- El càlcul queda testejat.

---

# Èpica 5 – Generació i visualització de proposta Kanban

## US-016 – Generar proposta Kanban

**Com a** administrador funcional  
**Vull** generar una proposta Kanban a partir dels articles importats i la configuració activa  
**Per tal de** obtenir Kmin, Klot i Kmax per article.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
- Existeix pantalla `/kanban`.
- L’usuari pot seleccionar un import completat.
- L’usuari pot seleccionar una configuració.
- El sistema genera proposta.
- La proposta inclou tots els articles amb consum o rotació vàlida.
- La proposta exclou articles sense consum de la taula principal.
- La proposta mostra resum general.
- La proposta queda guardada a base de dades.

### Notes tècniques
Endpoint suggerit:
- `POST /kanban/proposals`

---

## US-017 – Mostrar taula principal Kanban

**Com a** usuari operatiu  
**Vull** veure la taula de proposta Kanban article per article  
**Per tal de** aplicar el sistema al magatzem.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
La taula mostra:
- codi
- descripció
- cost unitari
- consum mitjà diari
- Kmin
- Klot
- Kmax
- valor a Kmin
- valor a Kmax
- estoc mitjà estimat
- valor d’estoc mitjà
- tipus de control
- justificació
- avisos

La taula permet:
- ordenar per valor Kmax
- filtrar per tipus de control
- buscar per codi o descripció
- exportar a Excel

---

## US-018 – Mostrar resum de proposta

**Com a** administrador funcional  
**Vull** veure un resum executiu de la proposta  
**Per tal de** entendre l’impacte global del Kanban.

### Prioritat
MVP – Alta

### Criteris d’acceptació
El resum mostra:
- nombre total d’articles analitzats
- nombre de Kanban físic simple
- nombre de control especial
- nombre d’excepcions cost 0
- valor total a Kmax
- valor d’estoc mitjà estimat
- top 10 articles per valor Kmax
- data de generació
- configuració utilitzada

---

## US-019 – Generar justificació entenedora per article

**Com a** usuari final  
**Vull** llegir una explicació simple de cada càlcul  
**Per tal de** entendre per què el sistema proposa aquests valors.

### Prioritat
MVP – Alta

### Criteris d’acceptació
Cada article té una justificació del tipus:
- consum mitjà diari calculat
- dies coberts pel Kmin
- lead time aplicat
- seguretat aplicada
- dies coberts pel Klot
- regla de cost aplicada
- motiu del tipus de control

### Exemple esperat
“Aquest article té un consum mitjà de 2,3 unitats/dia. El Kmin cobreix 7 dies de consum: 2 dies de reposició i 5 dies de seguretat. El Klot cobreix 15 dies perquè el cost unitari es troba entre 1 € i 10 €. Quan l’estoc arribi a Kmin, cal reposar Klot unitats. Després de reposar, el nivell objectiu serà Kmax.”

---

# Èpica 6 – Versionat i comparació de propostes

## US-020 – Guardar versions de proposta

**Com a** sistema  
**Vull** guardar cada proposta Kanban generada  
**Per tal de** mantenir traçabilitat històrica.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
- Cada proposta té número de versió.
- Cada proposta guarda:
  - import utilitzat
  - configuració utilitzada
  - data
  - usuari
  - hash de resultats
- Si es genera una proposta idèntica, no es crea nova versió.
- Si hi ha canvis, es crea una nova versió.
- El sistema permet consultar propostes anteriors.

---

## US-021 – Comparar dues versions

**Com a** administrador funcional  
**Vull** comparar dues propostes Kanban  
**Per tal de** veure quins articles han canviat i per què.

### Prioritat
Post-MVP – Alta

### Criteris d’acceptació
La comparativa mostra:
- articles nous
- articles eliminats
- canvis en Kmin
- canvis en Klot
- canvis en Kmax
- canvis en cost unitari
- canvis en consum mitjà diari
- canvis en tipus de control
- variació total de valor a Kmax

---

## US-022 – Registrar motiu de canvi

**Com a** administrador funcional  
**Vull** afegir comentaris a una nova versió  
**Per tal de** documentar per què s’ha generat o aprovat.

### Prioritat
Post-MVP – Mitjana

### Criteris d’acceptació
- L’usuari pot afegir comentari a una proposta.
- El comentari queda auditat.
- El comentari es mostra al detall de proposta.
- El comentari apareix a l’exportació.

---

# Èpica 7 – Exportació i informes

## US-023 – Exportar proposta a Excel

**Com a** usuari operatiu  
**Vull** exportar la proposta Kanban a Excel  
**Per tal de** treballar-la fora de l’aplicació o lliurar-la al client.

### Prioritat
MVP – Alta

### Criteris d’acceptació
L’Excel exportat conté pestanyes:
- `Resum`
- `Parametres`
- `Kanban`
- `Guia`
- `Excepcions`

La pestanya `Kanban` inclou:
- codi
- descripció
- cost unitari
- consum mitjà diari
- Kmin
- Klot
- Kmax
- valor a Kmin
- valor a Kmax
- tipus de control
- justificació

---

## US-024 – Exportar comparativa de versions

**Com a** administrador funcional  
**Vull** exportar la comparativa entre dues versions  
**Per tal de** justificar canvis de configuració o rotació.

### Prioritat
Post-MVP – Mitjana

### Criteris d’acceptació
- L’usuari selecciona dues versions.
- Es genera Excel amb:
  - resum de variacions
  - articles amb canvis
  - articles nous
  - articles eliminats
  - variació de valor econòmic
- El fitxer conserva data i identificador de versions.

---

# Èpica 8 – Excepcions, qualitat de dades i governança

## US-025 – Gestionar articles amb cost 0

**Com a** administrador funcional  
**Vull** identificar articles amb cost 0  
**Per tal de** no tancar un Kanban amb dades econòmiques incompletes.

### Prioritat
MVP – Alta

### Criteris d’acceptació
- Els articles amb cost 0 es marquen com a excepció.
- Apareixen en una taula separada.
- No es classifiquen com a Kanban físic simple.
- Es poden exportar.
- La proposta mostra alerta si hi ha articles amb cost 0.

---

## US-026 – Gestionar articles sense consum

**Com a** administrador funcional  
**Vull** separar articles sense consum o rotació  
**Per tal de** no distorsionar la proposta Kanban principal.

### Prioritat
MVP – Alta

### Criteris d’acceptació
- Els articles sense consum queden fora de la taula Kanban principal.
- Es mostren en una secció d’anàlisi complementària.
- Si tenen estoc, es mostra valor d’estoc immobilitzat.
- Es poden exportar en una pestanya separada.

---

## US-027 – Validar qualitat de dades importades

**Com a** sistema  
**Vull** detectar anomalies en les dades importades  
**Per tal de** avisar l’usuari abans de generar propostes.

### Prioritat
MVP – Alta

### Criteris d’acceptació
El sistema detecta:
- codi buit
- descripció buida
- cost negatiu
- consum negatiu
- consum extremadament alt
- duplicats de codi dins del mateix Excel
- articles amb cost 0
- articles sense consum
- decimals mal interpretats

---

# Èpica 9 – API, seguretat i auditoria

## US-028 – Definir API REST documentada

**Com a** desenvolupador  
**Vull** una API REST consistent  
**Per tal de** integrar frontend, backend i futures extensions.

### Prioritat
MVP – Alta

### Criteris d’acceptació
- Endpoints documentats amb Swagger/OpenAPI.
- Existeixen endpoints per:
  - imports
  - articles
  - configuració
  - propostes
  - exportació
- Les respostes d’error són consistents.
- Els DTOs validen entrada amb class-validator.

---

## US-029 – Afegir autenticació bàsica

**Com a** administrador  
**Vull** que només usuaris autoritzats accedeixin a l’aplicació  
**Per tal de** protegir dades de negoci.

### Prioritat
Post-MVP – Alta

### Criteris d’acceptació
- Login d’usuari.
- Sessions segures.
- Rols:
  - admin
  - user
- Només admin pot editar configuració.
- User pot consultar i exportar propostes.

---

## US-030 – Auditar accions principals

**Com a** administrador  
**Vull** guardar un registre d’accions importants  
**Per tal de** tenir traçabilitat de canvis.

### Prioritat
Post-MVP – Mitjana

### Criteris d’acceptació
S’auditen:
- importació d’Excel
- validació de mapatge
- canvi de configuració
- generació de proposta
- exportació
- eliminació o arxiu de proposta

---

# Èpica 10 – Tests i qualitat

## US-031 – Testejar motor Kanban

**Com a** desenvolupador  
**Vull** tests unitaris del motor Kanban  
**Per tal de** garantir que els càlculs són fiables i reproduïbles.

### Prioritat
MVP – Crítica

### Criteris d’acceptació
Tests per:
- càlcul de consum diari
- Kmin
- Klot per trams de cost
- Kmax
- rodoniment
- cost 0
- control especial
- valors límit

---

## US-032 – Testejar importació d’Excel

**Com a** desenvolupador  
**Vull** tests d’importació  
**Per tal de** evitar errors en mapatges i normalització.

### Prioritat
MVP – Alta

### Criteris d’acceptació
Tests per:
- Excel vàlid
- Excel sense columnes obligatòries
- decimals amb coma
- duplicats
- cost 0
- consum buit
- descripció buida

---

## US-033 – Testejar flux complet MVP

**Com a** desenvolupador  
**Vull** un test end-to-end del flux principal  
**Per tal de** validar que l’aplicació funciona de principi a fi.

### Prioritat
MVP – Alta

### Criteris d’acceptació
Flux:
1. importar Excel
2. revisar mapatge
3. sincronitzar articles
4. editar configuració
5. generar proposta
6. visualitzar taula Kanban
7. exportar Excel
8. generar nova versió si hi ha canvis

---

# Pla d’implementació recomanat

## Fase 0 – Preparació tècnica
User stories:
- US-001
- US-002

Resultat:
- projecte executable
- base de dades operativa
- models Prisma creats

## Fase 1 – Importació d’Excel
User stories:
- US-003
- US-004
- US-005
- US-006
- US-007

Resultat:
- l’usuari pot carregar un Excel
- Claude interpreta columnes
- l’usuari valida mapatge
- articles i mètriques queden guardats

## Fase 2 – Configuració Kanban
User stories:
- US-008
- US-009

Resultat:
- configuració editable i versionada

## Fase 3 – Motor Kanban
User stories:
- US-010
- US-011
- US-012
- US-013
- US-014
- US-015
- US-031

Resultat:
- càlcul Kanban fiable, testejat i auditable

## Fase 4 – Proposta Kanban i UI principal
User stories:
- US-016
- US-017
- US-018
- US-019
- US-025
- US-026
- US-027

Resultat:
- proposta visible, explicada i amb gestió d’excepcions

## Fase 5 – Exportació i versionat
User stories:
- US-020
- US-023
- US-033

Resultat:
- propostes guardades
- exportació Excel
- flux MVP complet

## Fase 6 – Millores post-MVP
User stories:
- US-021
- US-022
- US-024
- US-028
- US-029
- US-030
- US-032

Resultat:
- comparatives avançades
- seguretat
- auditoria
- robustesa productiva

---

# Definition of Done global

Una user story es considera completada quan:

- La funcionalitat està implementada al backend i/o frontend segons correspongui.
- Existeixen validacions d’entrada.
- Els errors es gestionen de forma clara per a l’usuari.
- Les dades es persisteixen correctament.
- Els càlculs són reproduïbles.
- Hi ha tests per la lògica crítica.
- La funcionalitat està documentada al README o document tècnic corresponent.
- Claude Code pot executar `test`, `lint` i `build` sense errors.
- La UI mostra estats de càrrega, èxit i error quan aplica.

---

# Prompt recomanat per passar a Claude Code

```text
You are working on the Kanban Lean application scaffold.

Read USER_STORIES_KANBAN_APP.md and prepare an implementation plan.

Your plan must include:
1. Implementation phases.
2. Technical tasks per user story.
3. Backend tasks.
4. Frontend tasks.
5. Database and Prisma tasks.
6. API endpoints.
7. Test strategy.
8. Risks and assumptions.
9. Recommended order of execution.

Do not implement everything at once.
Start by validating the current scaffold, installing dependencies, running Prisma migrations, and creating unit tests for the Kanban calculation engine.
```
