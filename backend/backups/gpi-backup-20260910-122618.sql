--
-- PostgreSQL database dump
--

\restrict CluaYEIDqIUlpph6EjnHKwcnuMkUonODkUczVV9l7QuyjY3L8PfQh9cMYFxInSO

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: gpi; Type: SCHEMA; Schema: -; Owner: gpi
--

CREATE SCHEMA gpi;


ALTER SCHEMA gpi OWNER TO gpi;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.agent (
    id_agent bigint NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    fonction character varying(100),
    telephone character varying(20),
    id_utilisateur bigint,
    email character varying(150)
);


ALTER TABLE gpi.agent OWNER TO gpi;

--
-- Name: agent_id_agent_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.agent_id_agent_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.agent_id_agent_seq OWNER TO gpi;

--
-- Name: agent_id_agent_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.agent_id_agent_seq OWNED BY gpi.agent.id_agent;


--
-- Name: categorie; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.categorie (
    id_categorie bigint NOT NULL,
    libelle character varying(100) NOT NULL,
    type character varying(20) NOT NULL,
    CONSTRAINT categorie_type_check CHECK (((type)::text = ANY ((ARRAY['HARDWARE'::character varying, 'SOFTWARE'::character varying, 'RESEAU'::character varying, 'AUTRE'::character varying])::text[])))
);


ALTER TABLE gpi.categorie OWNER TO gpi;

--
-- Name: categorie_id_categorie_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.categorie_id_categorie_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.categorie_id_categorie_seq OWNER TO gpi;

--
-- Name: categorie_id_categorie_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.categorie_id_categorie_seq OWNED BY gpi.categorie.id_categorie;


--
-- Name: equipement; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.equipement (
    id_equipement bigint NOT NULL,
    code_inventaire character varying(50) NOT NULL,
    tag_qr character varying(100),
    numero_serie character varying(100),
    nom character varying(150) NOT NULL,
    marque character varying(100),
    modele character varying(100),
    date_acquisition date,
    fin_garantie date,
    statut character varying(20) DEFAULT 'EN_STOCK'::character varying NOT NULL,
    cout_acquisition numeric(12,2),
    id_categorie bigint NOT NULL,
    id_localisation bigint NOT NULL,
    id_agent bigint,
    CONSTRAINT equipement_statut_check CHECK (((statut)::text = ANY ((ARRAY['EN_SERVICE'::character varying, 'EN_STOCK'::character varying, 'EN_PANNE'::character varying, 'MIS_AU_REBUT'::character varying])::text[])))
);


ALTER TABLE gpi.equipement OWNER TO gpi;

--
-- Name: equipement_id_equipement_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.equipement_id_equipement_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.equipement_id_equipement_seq OWNER TO gpi;

--
-- Name: equipement_id_equipement_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.equipement_id_equipement_seq OWNED BY gpi.equipement.id_equipement;


--
-- Name: equipement_logiciel; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.equipement_logiciel (
    id_equipement bigint NOT NULL,
    version character varying(50),
    nombre_licences integer,
    cle_licence character varying(255),
    date_debut_licence date,
    date_expiration_licence date
);


ALTER TABLE gpi.equipement_logiciel OWNER TO gpi;

--
-- Name: equipement_materiel; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.equipement_materiel (
    id_equipement bigint NOT NULL,
    processeur character varying(100),
    ram character varying(50),
    capacite_disque character varying(50),
    adresse_ip character varying(45),
    adresse_mac character varying(17),
    systeme_exploitation character varying(100)
);


ALTER TABLE gpi.equipement_materiel OWNER TO gpi;

--
-- Name: equipement_reseau; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.equipement_reseau (
    id_equipement bigint NOT NULL,
    adresse_ip character varying(45),
    adresse_mac character varying(17),
    type_adresse character varying(20) NOT NULL,
    nom_hote character varying(100),
    passerelle character varying(45),
    masque character varying(45),
    nombre_ports integer,
    CONSTRAINT equipement_reseau_type_adresse_check CHECK (((type_adresse)::text = ANY ((ARRAY['STATIQUE'::character varying, 'DYNAMIQUE'::character varying])::text[])))
);


ALTER TABLE gpi.equipement_reseau OWNER TO gpi;

--
-- Name: historique_mouvement; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.historique_mouvement (
    id_mouvement bigint NOT NULL,
    date_mouvement timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type_mouvement character varying(30) NOT NULL,
    motif character varying(255) NOT NULL,
    ancienne_valeur character varying(255),
    nouvelle_valeur character varying(255),
    id_equipement bigint NOT NULL,
    id_utilisateur_operateur bigint NOT NULL,
    CONSTRAINT historique_mouvement_type_mouvement_check CHECK (((type_mouvement)::text = ANY ((ARRAY['DEPLACEMENT'::character varying, 'CHANGEMENT_STATUT'::character varying, 'AFFECTATION'::character varying])::text[])))
);


ALTER TABLE gpi.historique_mouvement OWNER TO gpi;

--
-- Name: historique_mouvement_id_mouvement_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.historique_mouvement_id_mouvement_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.historique_mouvement_id_mouvement_seq OWNER TO gpi;

--
-- Name: historique_mouvement_id_mouvement_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.historique_mouvement_id_mouvement_seq OWNED BY gpi.historique_mouvement.id_mouvement;


--
-- Name: intervention; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.intervention (
    id_intervention bigint NOT NULL,
    diagnostic text,
    solution text,
    pieces_remplacees text,
    date_intervention timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_resolution timestamp without time zone,
    type_intervention character varying(20) NOT NULL,
    resultat character varying(20),
    rapport text,
    date_rapport timestamp without time zone,
    date_validation_dsi timestamp without time zone,
    id_panne bigint NOT NULL,
    id_utilisateur_technicien bigint NOT NULL,
    id_utilisateur_validateur_dsi bigint,
    CONSTRAINT intervention_resultat_check CHECK (((resultat)::text = ANY ((ARRAY['REPARATION'::character varying, 'DEPANNAGE'::character varying])::text[]))),
    CONSTRAINT intervention_type_intervention_check CHECK (((type_intervention)::text = ANY ((ARRAY['A_DISTANCE'::character varying, 'EN_PRESENTIEL'::character varying])::text[])))
);


ALTER TABLE gpi.intervention OWNER TO gpi;

--
-- Name: intervention_id_intervention_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.intervention_id_intervention_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.intervention_id_intervention_seq OWNER TO gpi;

--
-- Name: intervention_id_intervention_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.intervention_id_intervention_seq OWNED BY gpi.intervention.id_intervention;


--
-- Name: localisation; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.localisation (
    id_localisation bigint NOT NULL,
    annexe character varying(100) NOT NULL,
    service character varying(100) NOT NULL,
    bureau character varying(100),
    poste character varying(100),
    CONSTRAINT localisation_annexe_check CHECK (((annexe)::text = ANY ((ARRAY['AFEDOME'::character varying, 'AKODESSEWA'::character varying, 'ABLOGAME'::character varying, 'ADAKPAME'::character varying, 'KLOBATEME'::character varying])::text[])))
);


ALTER TABLE gpi.localisation OWNER TO gpi;

--
-- Name: localisation_id_localisation_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.localisation_id_localisation_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.localisation_id_localisation_seq OWNER TO gpi;

--
-- Name: localisation_id_localisation_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.localisation_id_localisation_seq OWNED BY gpi.localisation.id_localisation;


--
-- Name: log_systeme; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.log_systeme (
    id_log bigint NOT NULL,
    date_log timestamp without time zone DEFAULT now() NOT NULL,
    niveau character varying(20) NOT NULL,
    message character varying(500) NOT NULL,
    utilisateur character varying(150)
);


ALTER TABLE gpi.log_systeme OWNER TO gpi;

--
-- Name: log_systeme_id_log_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.log_systeme_id_log_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.log_systeme_id_log_seq OWNER TO gpi;

--
-- Name: log_systeme_id_log_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.log_systeme_id_log_seq OWNED BY gpi.log_systeme.id_log;


--
-- Name: message; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.message (
    id_message bigint NOT NULL,
    contenu text NOT NULL,
    date_envoi timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_intervention bigint NOT NULL,
    id_utilisateur_expediteur bigint NOT NULL
);


ALTER TABLE gpi.message OWNER TO gpi;

--
-- Name: message_id_message_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.message_id_message_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.message_id_message_seq OWNER TO gpi;

--
-- Name: message_id_message_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.message_id_message_seq OWNED BY gpi.message.id_message;


--
-- Name: panne; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.panne (
    id_panne bigint NOT NULL,
    description text NOT NULL,
    date_survenance timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    priorite character varying(20) NOT NULL,
    statut character varying(30) DEFAULT 'SIGNALEE'::character varying NOT NULL,
    note_satisfaction smallint,
    id_equipement bigint NOT NULL,
    id_utilisateur_signaleur bigint NOT NULL,
    CONSTRAINT panne_note_satisfaction_check CHECK (((note_satisfaction >= 1) AND (note_satisfaction <= 5))),
    CONSTRAINT panne_priorite_check CHECK (((priorite)::text = ANY ((ARRAY['FAIBLE'::character varying, 'MOYENNE'::character varying, 'ELEVEE'::character varying, 'CRITIQUE'::character varying])::text[]))),
    CONSTRAINT panne_statut_check CHECK (((statut)::text = ANY ((ARRAY['SIGNALEE'::character varying, 'EN_COURS_TRAITEMENT'::character varying, 'REPAREE'::character varying, 'REFORMEE'::character varying])::text[])))
);


ALTER TABLE gpi.panne OWNER TO gpi;

--
-- Name: panne_id_panne_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.panne_id_panne_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.panne_id_panne_seq OWNER TO gpi;

--
-- Name: panne_id_panne_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.panne_id_panne_seq OWNED BY gpi.panne.id_panne;


--
-- Name: piece_jointe; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.piece_jointe (
    id_piece_jointe bigint NOT NULL,
    chemin_fichier character varying(500) NOT NULL,
    type_fichier character varying(20) NOT NULL,
    vues_restantes integer DEFAULT 3 NOT NULL,
    vues_actuelles integer DEFAULT 0 NOT NULL,
    supprimee boolean DEFAULT false NOT NULL,
    supprimee_par_technicien boolean DEFAULT false NOT NULL,
    date_upload timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_expiration timestamp without time zone NOT NULL,
    date_suppression timestamp without time zone,
    id_panne bigint NOT NULL,
    CONSTRAINT piece_jointe_type_fichier_check CHECK (((type_fichier)::text = ANY ((ARRAY['VIDEO'::character varying, 'IMAGE'::character varying, 'PDF'::character varying])::text[])))
);


ALTER TABLE gpi.piece_jointe OWNER TO gpi;

--
-- Name: piece_jointe_id_piece_jointe_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.piece_jointe_id_piece_jointe_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.piece_jointe_id_piece_jointe_seq OWNER TO gpi;

--
-- Name: piece_jointe_id_piece_jointe_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.piece_jointe_id_piece_jointe_seq OWNED BY gpi.piece_jointe.id_piece_jointe;


--
-- Name: sauvegarde; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.sauvegarde (
    id_sauvegarde bigint NOT NULL,
    date_sauvegarde timestamp without time zone DEFAULT now() NOT NULL,
    chemin_fichier character varying(500) NOT NULL,
    taille_octets bigint,
    statut character varying(20) NOT NULL,
    declencheur character varying(20) NOT NULL,
    id_operateur bigint,
    message_erreur character varying(1000)
);


ALTER TABLE gpi.sauvegarde OWNER TO gpi;

--
-- Name: sauvegarde_id_sauvegarde_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.sauvegarde_id_sauvegarde_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.sauvegarde_id_sauvegarde_seq OWNER TO gpi;

--
-- Name: sauvegarde_id_sauvegarde_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.sauvegarde_id_sauvegarde_seq OWNED BY gpi.sauvegarde.id_sauvegarde;


--
-- Name: utilisateur; Type: TABLE; Schema: gpi; Owner: gpi
--

CREATE TABLE gpi.utilisateur (
    id_utilisateur bigint NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    mot_de_passe character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    actif boolean DEFAULT true NOT NULL,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email_verifie boolean DEFAULT false NOT NULL,
    code_verification character varying(6),
    date_expiration_code timestamp without time zone,
    CONSTRAINT utilisateur_role_check CHECK (((role)::text = ANY ((ARRAY['ADMIN_INFO'::character varying, 'TECHNICIEN'::character varying, 'RESPONSABLE_DSI'::character varying, 'ADMIN_SYSTEME'::character varying, 'AGENT'::character varying])::text[])))
);


ALTER TABLE gpi.utilisateur OWNER TO gpi;

--
-- Name: utilisateur_id_utilisateur_seq; Type: SEQUENCE; Schema: gpi; Owner: gpi
--

CREATE SEQUENCE gpi.utilisateur_id_utilisateur_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE gpi.utilisateur_id_utilisateur_seq OWNER TO gpi;

--
-- Name: utilisateur_id_utilisateur_seq; Type: SEQUENCE OWNED BY; Schema: gpi; Owner: gpi
--

ALTER SEQUENCE gpi.utilisateur_id_utilisateur_seq OWNED BY gpi.utilisateur.id_utilisateur;


--
-- Name: agent id_agent; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.agent ALTER COLUMN id_agent SET DEFAULT nextval('gpi.agent_id_agent_seq'::regclass);


--
-- Name: categorie id_categorie; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.categorie ALTER COLUMN id_categorie SET DEFAULT nextval('gpi.categorie_id_categorie_seq'::regclass);


--
-- Name: equipement id_equipement; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement ALTER COLUMN id_equipement SET DEFAULT nextval('gpi.equipement_id_equipement_seq'::regclass);


--
-- Name: historique_mouvement id_mouvement; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.historique_mouvement ALTER COLUMN id_mouvement SET DEFAULT nextval('gpi.historique_mouvement_id_mouvement_seq'::regclass);


--
-- Name: intervention id_intervention; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.intervention ALTER COLUMN id_intervention SET DEFAULT nextval('gpi.intervention_id_intervention_seq'::regclass);


--
-- Name: localisation id_localisation; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.localisation ALTER COLUMN id_localisation SET DEFAULT nextval('gpi.localisation_id_localisation_seq'::regclass);


--
-- Name: log_systeme id_log; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.log_systeme ALTER COLUMN id_log SET DEFAULT nextval('gpi.log_systeme_id_log_seq'::regclass);


--
-- Name: message id_message; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.message ALTER COLUMN id_message SET DEFAULT nextval('gpi.message_id_message_seq'::regclass);


--
-- Name: panne id_panne; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.panne ALTER COLUMN id_panne SET DEFAULT nextval('gpi.panne_id_panne_seq'::regclass);


--
-- Name: piece_jointe id_piece_jointe; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.piece_jointe ALTER COLUMN id_piece_jointe SET DEFAULT nextval('gpi.piece_jointe_id_piece_jointe_seq'::regclass);


--
-- Name: sauvegarde id_sauvegarde; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.sauvegarde ALTER COLUMN id_sauvegarde SET DEFAULT nextval('gpi.sauvegarde_id_sauvegarde_seq'::regclass);


--
-- Name: utilisateur id_utilisateur; Type: DEFAULT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.utilisateur ALTER COLUMN id_utilisateur SET DEFAULT nextval('gpi.utilisateur_id_utilisateur_seq'::regclass);


--
-- Data for Name: agent; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.agent (id_agent, nom, prenom, fonction, telephone, id_utilisateur, email) FROM stdin;
1	Mensah	Kossi	Agent Etat Civil	90000000	4	\N
2	MIKEM	Koété	Chef Section Patrimoine	+22890000000	3	\N
\.


--
-- Data for Name: categorie; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.categorie (id_categorie, libelle, type) FROM stdin;
1	Ordinateurs de bureau	HARDWARE
2	Equipement Réseau	RESEAU
3	LOGICIELS	SOFTWARE
4	Autres	AUTRE
5	Imprimantes	HARDWARE
\.


--
-- Data for Name: equipement; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.equipement (id_equipement, code_inventaire, tag_qr, numero_serie, nom, marque, modele, date_acquisition, fin_garantie, statut, cout_acquisition, id_categorie, id_localisation, id_agent) FROM stdin;
1	CG1-PC-0001	\N	SN123456	PC Bureau Etat Civil 1	HP	ProDesk 400	2024-01-15	\N	EN_SERVICE	350000.00	1	1	1
3	ORD-XX	ORD-XX	XXXXXX	DELL Latitude 7300	DELL	Latitude 7300	2026-11-11	2026-11-11	EN_SERVICE	520.00	1	11	\N
2	LGL-001	LGL-001	xxxxxxxx	Kaspersky 1.0	Kaspersky	1.0	2024-12-12	2030-12-12	EN_SERVICE	150.00	3	7	1
\.


--
-- Data for Name: equipement_logiciel; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.equipement_logiciel (id_equipement, version, nombre_licences, cle_licence, date_debut_licence, date_expiration_licence) FROM stdin;
2	2.0	4	XXX-XXX-XXX-XXX	2024-12-12	2026-12-12
\.


--
-- Data for Name: equipement_materiel; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.equipement_materiel (id_equipement, processeur, ram, capacite_disque, adresse_ip, adresse_mac, systeme_exploitation) FROM stdin;
1	Intel i5	8GB	256GB SSD	\N	\N	\N
3	3 GHZ	16 Go	512 GO	XX.XX.XXX.XX	AA:AA:AA:AA	Windows 11 professionnel
\.


--
-- Data for Name: equipement_reseau; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.equipement_reseau (id_equipement, adresse_ip, adresse_mac, type_adresse, nom_hote, passerelle, masque, nombre_ports) FROM stdin;
\.


--
-- Data for Name: historique_mouvement; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.historique_mouvement (id_mouvement, date_mouvement, type_mouvement, motif, ancienne_valeur, nouvelle_valeur, id_equipement, id_utilisateur_operateur) FROM stdin;
1	2026-08-28 10:58:19.617539	AFFECTATION	Changement d'affectation	Non affecte	Mensah Kossi	1	3
2	2026-08-28 11:19:15.107713	CHANGEMENT_STATUT	Intervention validée par DSI - REPARATION	EN_STOCK	EN_SERVICE	1	13
3	2026-09-05 02:15:30.714597	AFFECTATION	Changement d'affectation	Non affecte	MIKEM Koété	2	26
4	2026-09-07 17:31:13.850678	AFFECTATION	Changement d'affectation	MIKEM Koété	Mensah Kossi	2	26
\.


--
-- Data for Name: intervention; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.intervention (id_intervention, diagnostic, solution, pieces_remplacees, date_intervention, date_resolution, type_intervention, resultat, rapport, date_rapport, date_validation_dsi, id_panne, id_utilisateur_technicien, id_utilisateur_validateur_dsi) FROM stdin;
1	Alimentation defectueuse	Remplacement du bloc alimentation	Bloc alimentation 500W	2026-08-28 10:59:35.550796	2026-08-28 11:19:15.102904	EN_PRESENTIEL	REPARATION	Bloc alimentation remplace, poste operationnel	2026-08-28 11:03:55.985448	2026-08-28 11:19:15.102805	1	3	13
2	\N	\N	\N	2026-09-04 16:27:44.026553	\N	A_DISTANCE	\N	\N	\N	\N	1	15	\N
3	Pc ne s'allume plus car AC défaillant	Chagemenet de calbe d'alimentation	Cable d'alimentation	2026-09-04 16:28:42.509351	\N	A_DISTANCE	\N	\N	\N	\N	1	15	\N
4	\N	\N	\N	2026-09-04 16:42:25.622479	\N	A_DISTANCE	\N	\N	\N	\N	1	15	\N
5	\N	\N	\N	2026-09-04 16:42:48.525829	\N	EN_PRESENTIEL	\N	\N	\N	\N	1	15	\N
6	\N	\N	\N	2026-09-04 16:43:24.441559	\N	A_DISTANCE	\N	\N	\N	\N	1	15	\N
7	\N	\N	\N	2026-09-04 16:46:59.718661	\N	A_DISTANCE	\N	\N	\N	\N	1	15	\N
8	\N	\N	\N	2026-09-05 08:32:58.286474	\N	A_DISTANCE	\N	\N	\N	\N	1	15	\N
9	\N	\N	\N	2026-09-05 08:33:39.521559	\N	A_DISTANCE	\N	\N	\N	\N	1	21	\N
10	\N	\N	\N	2026-09-05 08:39:09.954727	\N	A_DISTANCE	\N	\N	\N	\N	1	21	\N
11	\N	\N	\N	2026-09-05 09:34:14.596833	\N	A_DISTANCE	\N	\N	\N	\N	1	25	\N
12	\N	\N	\N	2026-09-05 09:34:40.074573	\N	EN_PRESENTIEL	\N	\N	\N	\N	1	25	\N
13	\N	\N	\N	2026-09-05 09:34:57.977853	\N	A_DISTANCE	\N	\N	\N	\N	1	15	\N
14	Disfonctionnement du cable d'alimentation	Replacement du cable 	Cable AC de Dell	2026-09-07 16:49:42.48053	\N	A_DISTANCE	DEPANNAGE	\N	\N	\N	2	25	\N
\.


--
-- Data for Name: localisation; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.localisation (id_localisation, annexe, service, bureau, poste) FROM stdin;
1	AFEDOME	Etat Civil	Bureau 3	Chef Section Etat Civil 
2	AKODESSEWA	PRMP	Bureau 32	Assistant du PRMP
3	ABLOGAME	Secretarait	Bureau 32	Secrataire Général
4	ADAKPAME	Secretarait	Bureau 32	Secrataire Général
5	KLOBATEME	Secretarait	Bureau 32	Secrataire Général
6	ABLOGAME	SECRETARIAT ABLOGAME	Bureau XXX	Chef Superviseur de Couriers
7	ABLOGAME	Secretariat	B 2	Secraitaire Générale
8	AKODESSEWA	Secrétariat Général	\N	SG
10	AFEDOME	CelluleInfo	Bureau XX	Formateur
11	AFEDOME	CelluleInfo	Bureau XX	Formateur
\.


--
-- Data for Name: log_systeme; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.log_systeme (id_log, date_log, niveau, message, utilisateur) FROM stdin;
1	2026-09-10 11:34:01.211427	INFO	Connexion réussie - tableau de bord	litotek@gmail.com
\.


--
-- Data for Name: message; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.message (id_message, contenu, date_envoi, id_intervention, id_utilisateur_expediteur) FROM stdin;
1	Salut	2026-09-09 08:34:38.760945	8	26
\.


--
-- Data for Name: panne; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.panne (id_panne, description, date_survenance, priorite, statut, note_satisfaction, id_equipement, id_utilisateur_signaleur) FROM stdin;
1	L'ordinateur ne s'allume plus	2026-08-28 10:58:57.708373	ELEVEE	EN_COURS_TRAITEMENT	4	1	4
2	ça ne s'allume plus	2026-09-07 15:36:49.081134	MOYENNE	EN_COURS_TRAITEMENT	\N	1	4
\.


--
-- Data for Name: piece_jointe; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.piece_jointe (id_piece_jointe, chemin_fichier, type_fichier, vues_restantes, vues_actuelles, supprimee, supprimee_par_technicien, date_upload, date_expiration, date_suppression, id_panne) FROM stdin;
\.


--
-- Data for Name: sauvegarde; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.sauvegarde (id_sauvegarde, date_sauvegarde, chemin_fichier, taille_octets, statut, declencheur, id_operateur, message_erreur) FROM stdin;
\.


--
-- Data for Name: utilisateur; Type: TABLE DATA; Schema: gpi; Owner: gpi
--

COPY gpi.utilisateur (id_utilisateur, nom, prenom, email, mot_de_passe, role, actif, date_creation, email_verifie, code_verification, date_expiration_code) FROM stdin;
2	Admin	System	admin@mairie.golfe1.tg	$2a$10$yaiPyY07jh9Dn5xGlHBDOO3GpZj7OHntKNCXSd2nM0c14kWNRL0aq	ADMIN_INFO	t	2026-08-26 15:28:55.433286	t	\N	\N
3	Kodjo	Ama	tech@golfe1.tg	$2a$10$l4vl8/x8Bp3YMSmcmD.5COJJpoORviGj3b.BrQAEndZnZEdUC3MZC	TECHNICIEN	t	2026-08-27 17:51:33.812908	t	\N	\N
4	Mensah	Kossi	agent@golfe1.tg	$2a$10$QBmZ94SDejv2njv6a8.QSONQfWW.C.AVgGbCEKwIC7CpIk9NbRY5C	AGENT	t	2026-08-27 17:51:33.75546	t	\N	\N
6	Bedel	Josue	admin@golfe1.tg	$2a$10$E9jJXsZyUJiPEkKgFQRx2.g2ht.lh7gpBigfpPY8dSwlA4NlR.KQu	ADMIN_INFO	t	2026-08-27 17:51:33.758275	t	\N	\N
13	Adjovi	Yao	dsi@golfe1.tg	$2a$10$RNZdFi3Lyea8BBrN8eV7Iu2vdhi/HNAHrfJXKMh6C2Q0A5O4LP5wK	RESPONSABLE_DSI	t	2026-08-28 08:12:52.881688	t	\N	\N
18	Josh	BEDELIOS	joshfigma001@gmail.com	$2a$10$j.qZ0oYXcpHNlJ2FjYtOZ.eRV6Nh.c0LnIEg/04ASPpToexNhF4tu	AGENT	t	2026-08-30 04:00:25.4316	f	743114	2026-08-30 04:15:25.432008
16	Test	Cookie	joshbedel55@gmail.com	$2a$10$IkDxfq7bOD5cZwJnaxVl8e7UzUrBJIYIlDtlFpFT/Yp7UGy/Dhmz2	AGENT	t	2026-08-29 23:34:55.014183	t	\N	\N
19	BEDEL	Daniel	danilobedel5@gmail.com	$2a$10$h9AXg7qKzkuCgqUEbsZiB.xVmAEq/M9o8KxQXuncNIsORZXDPvRyy	AGENT	t	2026-09-01 03:23:38.976322	t	\N	\N
20	Test	Agent	agent.test@golfe1.tg	$2b$10$kZxBIC6wrMEVuKfzZvaiCen6NXsMS5thiRt3fJppmvSzVOdsD.zcO	AGENT	t	2026-09-01 10:52:12.691549	t	\N	\N
21	Test	Technicien	technicien.test@golfe1.tg	$2b$10$kZxBIC6wrMEVuKfzZvaiCen6NXsMS5thiRt3fJppmvSzVOdsD.zcO	TECHNICIEN	t	2026-09-01 10:52:12.691549	t	\N	\N
22	Test	AdminInfo	admininfo.test@golfe1.tg	$2b$10$kZxBIC6wrMEVuKfzZvaiCen6NXsMS5thiRt3fJppmvSzVOdsD.zcO	ADMIN_INFO	t	2026-09-01 10:52:12.691549	t	\N	\N
23	Test	ResponsableDsi	dsi.test@golfe1.tg	$2b$10$kZxBIC6wrMEVuKfzZvaiCen6NXsMS5thiRt3fJppmvSzVOdsD.zcO	RESPONSABLE_DSI	t	2026-09-01 10:52:12.691549	t	\N	\N
24	Test	AdminSysteme	adminsysteme.test@golfe1.tg	$2b$10$kZxBIC6wrMEVuKfzZvaiCen6NXsMS5thiRt3fJppmvSzVOdsD.zcO	TECHNICIEN	t	2026-09-01 10:52:12.691549	t	\N	\N
25	DJOSSOU EKOE	Jacques	jak2djos@gmail.com	$2a$10$HjTZzNExY.9MoFSaGCPeau4k54STz/80ZsEb0pk0ry0jvh.Y9ijJ2	TECHNICIEN	t	2026-09-01 12:29:50.589036	t	\N	\N
15	Josué	BEDEL	josuebedeldev@gmail.com	$2a$10$tuc3/72u1C16T52IygP.Gu6RJa/GvteoENMqny1s77cKj5zzzp7f6	TECHNICIEN	t	2026-08-29 23:27:31.41972	f	892949	2026-08-29 23:42:31.420018
1	Directeur	DSI	dsi@mairie.golfe1.tg	$2a$10$uYPxQbEd.lpLcjGBzS13Z.cbR7gXww/Wh6JhkPjAvgAYqt4oPqXde	ADMIN_SYSTEME	t	2026-08-26 15:02:42.295536	t	\N	\N
26	TOSSOU	Kossivignon 	litotek@gmail.com	$2a$10$V.NkKPU1PGJszk3NTuJsy.QFR2z52rgnEfhMY52.k63dU1SjPiBaW	ADMIN_INFO	t	2026-09-04 17:44:10.615071	t	\N	\N
27	TOGBA	Lazare	togbalazre5@gmail.com	$2a$10$wZM9L37tCW5CqRjJ8dFUPOuDr6jQxmxZ89nJJTPQ9Q26uF4n2orc2	AGENT	t	2026-09-07 16:27:49.045305	f	260872	2026-09-07 16:29:49.046229
17	BEDEL	Technicien	joshbedel623@gmail.com	$2a$10$vkISOcLIHiwTTwtxwasvV.ojT/gKKs0OgfswQoax4WRbgbW58vxey	AGENT	t	2026-08-29 23:35:19.558716	t	\N	\N
28	TOGBA	Lazare	togbalazare5@gmail.com	$2a$10$B7VdjRPABvi.Sr1pVOz57e/RMcmtubzdQ4cGGESrMQDI2EA808C8G	ADMIN_INFO	t	2026-09-07 16:29:15.154049	t	\N	\N
\.


--
-- Name: agent_id_agent_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.agent_id_agent_seq', 2, true);


--
-- Name: categorie_id_categorie_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.categorie_id_categorie_seq', 5, true);


--
-- Name: equipement_id_equipement_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.equipement_id_equipement_seq', 3, true);


--
-- Name: historique_mouvement_id_mouvement_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.historique_mouvement_id_mouvement_seq', 4, true);


--
-- Name: intervention_id_intervention_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.intervention_id_intervention_seq', 14, true);


--
-- Name: localisation_id_localisation_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.localisation_id_localisation_seq', 11, true);


--
-- Name: log_systeme_id_log_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.log_systeme_id_log_seq', 1, true);


--
-- Name: message_id_message_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.message_id_message_seq', 1, true);


--
-- Name: panne_id_panne_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.panne_id_panne_seq', 2, true);


--
-- Name: piece_jointe_id_piece_jointe_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.piece_jointe_id_piece_jointe_seq', 1, false);


--
-- Name: sauvegarde_id_sauvegarde_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.sauvegarde_id_sauvegarde_seq', 1, true);


--
-- Name: utilisateur_id_utilisateur_seq; Type: SEQUENCE SET; Schema: gpi; Owner: gpi
--

SELECT pg_catalog.setval('gpi.utilisateur_id_utilisateur_seq', 28, true);


--
-- Name: agent agent_id_utilisateur_key; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.agent
    ADD CONSTRAINT agent_id_utilisateur_key UNIQUE (id_utilisateur);


--
-- Name: agent agent_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.agent
    ADD CONSTRAINT agent_pkey PRIMARY KEY (id_agent);


--
-- Name: categorie categorie_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.categorie
    ADD CONSTRAINT categorie_pkey PRIMARY KEY (id_categorie);


--
-- Name: equipement equipement_code_inventaire_key; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement
    ADD CONSTRAINT equipement_code_inventaire_key UNIQUE (code_inventaire);


--
-- Name: equipement_logiciel equipement_logiciel_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement_logiciel
    ADD CONSTRAINT equipement_logiciel_pkey PRIMARY KEY (id_equipement);


--
-- Name: equipement_materiel equipement_materiel_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement_materiel
    ADD CONSTRAINT equipement_materiel_pkey PRIMARY KEY (id_equipement);


--
-- Name: equipement equipement_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement
    ADD CONSTRAINT equipement_pkey PRIMARY KEY (id_equipement);


--
-- Name: equipement_reseau equipement_reseau_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement_reseau
    ADD CONSTRAINT equipement_reseau_pkey PRIMARY KEY (id_equipement);


--
-- Name: historique_mouvement historique_mouvement_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.historique_mouvement
    ADD CONSTRAINT historique_mouvement_pkey PRIMARY KEY (id_mouvement);


--
-- Name: intervention intervention_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.intervention
    ADD CONSTRAINT intervention_pkey PRIMARY KEY (id_intervention);


--
-- Name: localisation localisation_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.localisation
    ADD CONSTRAINT localisation_pkey PRIMARY KEY (id_localisation);


--
-- Name: log_systeme log_systeme_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.log_systeme
    ADD CONSTRAINT log_systeme_pkey PRIMARY KEY (id_log);


--
-- Name: message message_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (id_message);


--
-- Name: panne panne_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.panne
    ADD CONSTRAINT panne_pkey PRIMARY KEY (id_panne);


--
-- Name: piece_jointe piece_jointe_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.piece_jointe
    ADD CONSTRAINT piece_jointe_pkey PRIMARY KEY (id_piece_jointe);


--
-- Name: sauvegarde sauvegarde_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.sauvegarde
    ADD CONSTRAINT sauvegarde_pkey PRIMARY KEY (id_sauvegarde);


--
-- Name: utilisateur utilisateur_email_key; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.utilisateur
    ADD CONSTRAINT utilisateur_email_key UNIQUE (email);


--
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id_utilisateur);


--
-- Name: idx_equipement_agent; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_equipement_agent ON gpi.equipement USING btree (id_agent);


--
-- Name: idx_equipement_categorie; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_equipement_categorie ON gpi.equipement USING btree (id_categorie);


--
-- Name: idx_equipement_localisation; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_equipement_localisation ON gpi.equipement USING btree (id_localisation);


--
-- Name: idx_equipement_statut; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_equipement_statut ON gpi.equipement USING btree (statut);


--
-- Name: idx_historique_date; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_historique_date ON gpi.historique_mouvement USING btree (date_mouvement);


--
-- Name: idx_historique_equipement; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_historique_equipement ON gpi.historique_mouvement USING btree (id_equipement);


--
-- Name: idx_intervention_panne; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_intervention_panne ON gpi.intervention USING btree (id_panne);


--
-- Name: idx_log_systeme_date; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_log_systeme_date ON gpi.log_systeme USING btree (date_log DESC);


--
-- Name: idx_panne_equipement; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_panne_equipement ON gpi.panne USING btree (id_equipement);


--
-- Name: idx_panne_statut; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_panne_statut ON gpi.panne USING btree (statut);


--
-- Name: idx_piece_jointe_expiration; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_piece_jointe_expiration ON gpi.piece_jointe USING btree (date_expiration);


--
-- Name: idx_piece_jointe_panne; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_piece_jointe_panne ON gpi.piece_jointe USING btree (id_panne);


--
-- Name: idx_piece_jointe_supprimee; Type: INDEX; Schema: gpi; Owner: gpi
--

CREATE INDEX idx_piece_jointe_supprimee ON gpi.piece_jointe USING btree (supprimee);


--
-- Name: agent agent_id_utilisateur_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.agent
    ADD CONSTRAINT agent_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) REFERENCES gpi.utilisateur(id_utilisateur);


--
-- Name: equipement equipement_id_agent_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement
    ADD CONSTRAINT equipement_id_agent_fkey FOREIGN KEY (id_agent) REFERENCES gpi.agent(id_agent);


--
-- Name: equipement equipement_id_categorie_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement
    ADD CONSTRAINT equipement_id_categorie_fkey FOREIGN KEY (id_categorie) REFERENCES gpi.categorie(id_categorie);


--
-- Name: equipement equipement_id_localisation_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement
    ADD CONSTRAINT equipement_id_localisation_fkey FOREIGN KEY (id_localisation) REFERENCES gpi.localisation(id_localisation);


--
-- Name: equipement_logiciel equipement_logiciel_id_equipement_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement_logiciel
    ADD CONSTRAINT equipement_logiciel_id_equipement_fkey FOREIGN KEY (id_equipement) REFERENCES gpi.equipement(id_equipement) ON DELETE CASCADE;


--
-- Name: equipement_materiel equipement_materiel_id_equipement_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement_materiel
    ADD CONSTRAINT equipement_materiel_id_equipement_fkey FOREIGN KEY (id_equipement) REFERENCES gpi.equipement(id_equipement) ON DELETE CASCADE;


--
-- Name: equipement_reseau equipement_reseau_id_equipement_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.equipement_reseau
    ADD CONSTRAINT equipement_reseau_id_equipement_fkey FOREIGN KEY (id_equipement) REFERENCES gpi.equipement(id_equipement) ON DELETE CASCADE;


--
-- Name: historique_mouvement historique_mouvement_id_equipement_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.historique_mouvement
    ADD CONSTRAINT historique_mouvement_id_equipement_fkey FOREIGN KEY (id_equipement) REFERENCES gpi.equipement(id_equipement);


--
-- Name: historique_mouvement historique_mouvement_id_utilisateur_operateur_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.historique_mouvement
    ADD CONSTRAINT historique_mouvement_id_utilisateur_operateur_fkey FOREIGN KEY (id_utilisateur_operateur) REFERENCES gpi.utilisateur(id_utilisateur);


--
-- Name: intervention intervention_id_panne_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.intervention
    ADD CONSTRAINT intervention_id_panne_fkey FOREIGN KEY (id_panne) REFERENCES gpi.panne(id_panne);


--
-- Name: intervention intervention_id_utilisateur_technicien_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.intervention
    ADD CONSTRAINT intervention_id_utilisateur_technicien_fkey FOREIGN KEY (id_utilisateur_technicien) REFERENCES gpi.utilisateur(id_utilisateur);


--
-- Name: intervention intervention_id_utilisateur_validateur_dsi_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.intervention
    ADD CONSTRAINT intervention_id_utilisateur_validateur_dsi_fkey FOREIGN KEY (id_utilisateur_validateur_dsi) REFERENCES gpi.utilisateur(id_utilisateur);


--
-- Name: message message_id_intervention_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.message
    ADD CONSTRAINT message_id_intervention_fkey FOREIGN KEY (id_intervention) REFERENCES gpi.intervention(id_intervention);


--
-- Name: message message_id_utilisateur_expediteur_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.message
    ADD CONSTRAINT message_id_utilisateur_expediteur_fkey FOREIGN KEY (id_utilisateur_expediteur) REFERENCES gpi.utilisateur(id_utilisateur);


--
-- Name: panne panne_id_equipement_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.panne
    ADD CONSTRAINT panne_id_equipement_fkey FOREIGN KEY (id_equipement) REFERENCES gpi.equipement(id_equipement);


--
-- Name: panne panne_id_utilisateur_signaleur_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.panne
    ADD CONSTRAINT panne_id_utilisateur_signaleur_fkey FOREIGN KEY (id_utilisateur_signaleur) REFERENCES gpi.utilisateur(id_utilisateur);


--
-- Name: piece_jointe piece_jointe_id_panne_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.piece_jointe
    ADD CONSTRAINT piece_jointe_id_panne_fkey FOREIGN KEY (id_panne) REFERENCES gpi.panne(id_panne) ON DELETE CASCADE;


--
-- Name: sauvegarde sauvegarde_id_operateur_fkey; Type: FK CONSTRAINT; Schema: gpi; Owner: gpi
--

ALTER TABLE ONLY gpi.sauvegarde
    ADD CONSTRAINT sauvegarde_id_operateur_fkey FOREIGN KEY (id_operateur) REFERENCES gpi.utilisateur(id_utilisateur);


--
-- PostgreSQL database dump complete
--

\unrestrict CluaYEIDqIUlpph6EjnHKwcnuMkUonODkUczVV9l7QuyjY3L8PfQh9cMYFxInSO

