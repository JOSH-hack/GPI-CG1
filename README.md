# GPI - Gestion du Parc Informatique - Commune du Golfe 1

Plateforme web de gestion du parc informatique et suivi des equipements
(Asset Management), pour la Commune du Golfe 1 (Mairie de Be-Afedome).

Cahier des charges V2.0 - Cellule Informatique.

## Structure du depot (monorepo)

```
gpi-golfe1/
├── frontend/     # Application React 19 + Vite + MUI
├── backend/      # Application Spring Boot 3+ (API REST)
├── database/     # Scripts SQL (DDL, DML, jeu d'essai initial)
└── docs/         # Modelisation (MCD, MLD, MPD, UML, cas d'utilisation)
```

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite + Material UI v6 |
| Backend | Spring Boot 3+, Spring Security + JWT, Spring Data JPA |
| Base de donnees | PostgreSQL |

## Backend - demarrage

```bash
cd backend
# variables d'environnement attendues (voir application.properties) :
# DB_USERNAME, DB_PASSWORD, JWT_SECRET
mvn spring-boot:run
```

Le schema de base de donnees est cree manuellement via `database/schema.sql`
(derive du MPD, voir docs/) - Hibernate est configure en `ddl-auto=validate`,
il ne modifie jamais le schema automatiquement.
