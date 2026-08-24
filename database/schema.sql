-- GPI - Gestion du Parc Informatique - Commune du Golfe 1
-- Cible : schema "gpi" (cree au prealable via CREATE SCHEMA gpi AUTHORIZATION gpi;)

SET search_path TO gpi;

-- UTILISATEUR
CREATE TABLE utilisateur (
    id_utilisateur      SERIAL PRIMARY KEY,
    nom                 VARCHAR(100) NOT NULL,
    prenom              VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe        VARCHAR(255) NOT NULL,
    role                VARCHAR(20) NOT NULL
                         CHECK (role IN ('ADMIN_INFO','TECHNICIEN','RESPONSABLE_DSI','ADMIN_SYSTEME','AGENT')),
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIE
CREATE TABLE categorie (
    id_categorie        SERIAL PRIMARY KEY,
    libelle             VARCHAR(100) NOT NULL,
    type                VARCHAR(20) NOT NULL
                         CHECK (type IN ('HARDWARE','SOFTWARE','RESEAU'))
);

-- LOCALISATION
CREATE TABLE localisation (
    id_localisation     SERIAL PRIMARY KEY,
    annexe              VARCHAR(100) NOT NULL,
    service             VARCHAR(100) NOT NULL,
    bureau              VARCHAR(100),
    poste               VARCHAR(100)
);

-- AGENT (lien optionnel vers un compte Utilisateur)
CREATE TABLE agent (
    id_agent            SERIAL PRIMARY KEY,
    nom                 VARCHAR(100) NOT NULL,
    prenom              VARCHAR(100) NOT NULL,
    fonction            VARCHAR(100),
    telephone           VARCHAR(20),
    id_utilisateur      INTEGER UNIQUE
                         REFERENCES utilisateur(id_utilisateur)
);

-- EQUIPEMENT (table mere de la specialisation)
CREATE TABLE equipement (
    id_equipement       SERIAL PRIMARY KEY,
    code_inventaire     VARCHAR(50) NOT NULL UNIQUE,
    tag_qr              VARCHAR(100),
    numero_serie        VARCHAR(100),
    nom                 VARCHAR(150) NOT NULL,
    marque              VARCHAR(100),
    modele              VARCHAR(100),
    date_acquisition    DATE,
    fin_garantie        DATE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'EN_STOCK'
                         CHECK (statut IN ('EN_SERVICE','EN_STOCK','EN_PANNE','MIS_AU_REBUT')),
    cout_acquisition    NUMERIC(12,2),
    id_categorie        INTEGER NOT NULL REFERENCES categorie(id_categorie),
    id_localisation     INTEGER NOT NULL REFERENCES localisation(id_localisation),
    id_agent            INTEGER REFERENCES agent(id_agent)
);

-- Sous-types EQUIPEMENT (heritage par table separee - contrainte T,X)
CREATE TABLE equipement_materiel (
    id_equipement           INTEGER PRIMARY KEY
                             REFERENCES equipement(id_equipement) ON DELETE CASCADE,
    processeur               VARCHAR(100),
    ram                       VARCHAR(50),
    capacite_disque          VARCHAR(50),
    adresse_ip                VARCHAR(45),
    adresse_mac                VARCHAR(17),
    systeme_exploitation     VARCHAR(100)
);

CREATE TABLE equipement_logiciel (
    id_equipement            INTEGER PRIMARY KEY
                             REFERENCES equipement(id_equipement) ON DELETE CASCADE,
    version                   VARCHAR(50),
    nombre_licences          INTEGER,
    cle_licence               VARCHAR(255),
    date_debut_licence       DATE,
    date_expiration_licence  DATE
);

CREATE TABLE equipement_reseau (
    id_equipement            INTEGER PRIMARY KEY
                             REFERENCES equipement(id_equipement) ON DELETE CASCADE,
    adresse_ip                VARCHAR(45),
    adresse_mac                VARCHAR(17),
    type_adresse              VARCHAR(20) NOT NULL
                             CHECK (type_adresse IN ('STATIQUE','DYNAMIQUE')),
    nom_hote                  VARCHAR(100),
    passerelle                VARCHAR(45),
    masque                    VARCHAR(45),
    nombre_ports              INTEGER
);

-- PANNE
CREATE TABLE panne (
    id_panne                 SERIAL PRIMARY KEY,
    description               TEXT NOT NULL,
    date_survenance          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    priorite                  VARCHAR(20) NOT NULL
                             CHECK (priorite IN ('FAIBLE','MOYENNE','ELEVEE','CRITIQUE')),
    statut                    VARCHAR(30) NOT NULL DEFAULT 'SIGNALEE'
                             CHECK (statut IN ('SIGNALEE','EN_COURS_TRAITEMENT','REPAREE','REFORMEE')),
    note_satisfaction        SMALLINT
                             CHECK (note_satisfaction BETWEEN 1 AND 5),
    id_equipement             INTEGER NOT NULL REFERENCES equipement(id_equipement),
    id_utilisateur_signaleur INTEGER NOT NULL REFERENCES utilisateur(id_utilisateur)
);

-- INTERVENTION
CREATE TABLE intervention (
    id_intervention                 SERIAL PRIMARY KEY,
    diagnostic                       TEXT,
    solution                         TEXT,
    pieces_remplacees                TEXT,
    date_intervention                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_resolution                  TIMESTAMP,
    type_intervention                VARCHAR(20) NOT NULL
                                    CHECK (type_intervention IN ('A_DISTANCE','EN_PRESENTIEL')),
    resultat                         VARCHAR(20)
                                    CHECK (resultat IN ('REPARATION','DEPANNAGE')),
    rapport                          TEXT,
    date_rapport                     TIMESTAMP,
    date_validation_dsi              TIMESTAMP,
    id_panne                         INTEGER NOT NULL REFERENCES panne(id_panne),
    id_utilisateur_technicien        INTEGER NOT NULL REFERENCES utilisateur(id_utilisateur),
    id_utilisateur_validateur_dsi    INTEGER REFERENCES utilisateur(id_utilisateur)
);

-- MESSAGE (chat d'intervention a distance)
CREATE TABLE message (
    id_message                  SERIAL PRIMARY KEY,
    contenu                      TEXT NOT NULL,
    date_envoi                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_intervention              INTEGER NOT NULL REFERENCES intervention(id_intervention),
    id_utilisateur_expediteur    INTEGER NOT NULL REFERENCES utilisateur(id_utilisateur)
);

-- HISTORIQUE_MOUVEMENT (tracabilite RG-04)
CREATE TABLE historique_mouvement (
    id_mouvement              SERIAL PRIMARY KEY,
    date_mouvement            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type_mouvement            VARCHAR(30) NOT NULL
                             CHECK (type_mouvement IN ('DEPLACEMENT','CHANGEMENT_STATUT','AFFECTATION')),
    motif                     VARCHAR(255) NOT NULL,
    ancienne_valeur           VARCHAR(255),
    nouvelle_valeur           VARCHAR(255),
    id_equipement              INTEGER NOT NULL REFERENCES equipement(id_equipement),
    id_utilisateur_operateur  INTEGER NOT NULL REFERENCES utilisateur(id_utilisateur)
);

-- INDEX (colonnes frequemment filtrees/recherchees)
CREATE INDEX idx_equipement_statut ON equipement(statut);
CREATE INDEX idx_equipement_categorie ON equipement(id_categorie);
CREATE INDEX idx_equipement_localisation ON equipement(id_localisation);
CREATE INDEX idx_equipement_agent ON equipement(id_agent);
CREATE INDEX idx_panne_statut ON panne(statut);
CREATE INDEX idx_panne_equipement ON panne(id_equipement);
CREATE INDEX idx_intervention_panne ON intervention(id_panne);
CREATE INDEX idx_historique_equipement ON historique_mouvement(id_equipement);
CREATE INDEX idx_historique_date ON historique_mouvement(date_mouvement);
