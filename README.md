<p align="center">
  <img src="docs/images/logocg1.png" alt="Logo Commune Golfe 1" width="120"/>
</p>

<h1 align="center">MAIRIE DU GOLFE 1 - Bè Apédomé</h1>
<h3 align="center">Travail - Liberté - Patrie</h3>

# Gestion du Parc Informatique – Commune du Golfe 1

Plateforme web de **Gestion du Parc Informatique (GPI)** de la Commune du Golfe 1 (Mairie de Bè-Apédomé).
Ce projet vise à centraliser, tracer et piloter l’ensemble des équipements informatiques (hardware, software, réseau) de la mairie, en remplaçant les registres papier par une solution numérique moderne.

## Objectifs

- Inventaire unique avec code QR
- Cartographie des emplacements
- Cycle de vie complet des équipements
- Reporting et tableaux de bord
- Sécurité des accès (RBAC)

## Profils Utilisateurs

- Administrateur Informatique : gestion complète de l’application, comptes, référentiels, sauvegardes.
- Technicien Informatique : saisie/mise à jour des équipements, enregistrement des pannes, interventions.
- Responsable Informatique / DSI : consultation globale, validation des réformes, génération de rapports.
- Administrateur Système : supervision technique, gestion PostgreSQL, déploiement des mises à jour.

## Stack Technique

- Frontend : React 19 + Vite + Material UI (MUI v6)
- Backend : Spring Boot 3 + Spring Security + JWT
- ORM : Spring Data JPA / Hibernate
- Base de données : PostgreSQL
- Outils : VS Code, Git/GitHub, Postman

## 📂 Structure du projet

gpi-golfe1/
├── frontend/        → Application React (UI, pages, services)
├── backend/         → Application Spring Boot (API REST)
│    ├── controllers/   → Endpoints REST
│    ├── services/      → Logique métier
│    ├── repositories/  → Interfaces JPA
│    ├── entities/      → Entités JPA + enums
│    └── security/      → Config Spring Security & JWT
├── database/        → Scripts SQL (DDL/DML), MCD/MLD/MPD
└── docs/            → Documentation technique & fonctionnelle

Code

## Installation & Démarrage

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
Frontend (React)
```

### Frontend ( React )

```Shell
cd frontend
npm install
npm run dev
```

### Base de données (PostgreSQL)

Importer le script database/schema.sql pour créer les tables.

Configurer application.properties :

```JavaScript
spring.datasource.url=jdbc:postgresql://localhost:5432/gpi
spring.datasource.username=postgres
spring.datasource.password=motdepasse
spring.jpa.hibernate.ddl-auto=update
```

### Modules Fonctionnels

Gestion des actifs : fiches équipements, catégories, caractéristiques.

Organisation & emplacements : arborescence géographique et affectations.

Suivi des incidents : journal des pannes, interventions, historique des mouvements.

Tableau de bord : KPIs, statistiques, exports.

Administration & sécurité : gestion des utilisateurs, rôles, logs d’audit.

### Planning (Août 2026)

* [X] Phase 1 (03/08) : Analyse & conception (MCD, MLD, MPD, UML).
* [ ] Phase 2 (10/08) : Backend & base de données (entités JPA, repositories, services). --> En cours
* [ ] Phase 3 (17/08) : Endpoints REST (CRUD, tests Postman).
* [ ] Phase 4 (24/08) : Frontend React + intégration Axios.
* [ ] Phase 5 (31/08) : Recette, documentation & livraison finale.

### Livrables

* [X] Cahier des charges validé
* [X] Diagrammes de conception (MCD, MLD, UML)
* [X] Base PostgreSQL initialisée
* [ ] Code source complet (Frontend + Backend)
* [ ] Documentation technique & guide utilisateur

<p align="center">
<img src="docs/images/logocg1.png" alt="Logo Commune Golfe 1" width="80"/>
</p>
