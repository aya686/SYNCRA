# SCÉNARIO - Plateforme TAIB (Offres, Collaboration & Finances)

## 🎯 Vue d'Ensemble

Construction d'une marketplace pour offres d'emploi/appels d'offres avec gestion complète du cycle de vie :
**Publication → Candidature → Évaluation → Contrat → Paiement → Investissement**

## 📋 Architecture

### Frontend (Angular - Template Berry)
- **Front Office** : Utilise les pages publiques (home, landing) du template
- **Back Office** : Utilise les pages dashboard/admin du template
- **Styles** : Conservation complète du design system Berry

### Backend (Spring Boot)
- **MS5 Module 1** : Gestion des Offres & Appels d'offres (START HERE)
- **MS5 Module 2** : Gestion des Candidatures (NEXT)
- **MS5 Module 3** : Gestion des Contrats
- **MS5 Module 4** : Gestion des Investisseurs
- **MS5 Module 5** : Gestion des Paiements

---

## 🏗️ MODULE 1 - Gestion des Offres & Appels d'Offres

### Entités

#### 1. Categorie
```
id: Long (PK)
nom: String (NOT NULL, max 100, UNIQUE)
description: String (max 500)
iconeUrl: String (nullable)
active: Boolean (NOT NULL, default = true)
```

#### 2. Offre (Offre d'emploi ou Appel d'offres simplifié)
```
id: Long (PK)
titre: String (NOT NULL, max 200)
description: String (NOT NULL, TEXT)
budgetMin: Double (NOT NULL, min = 0)
budgetMax: Double (nullable)
deadline: LocalDateTime (NOT NULL)
datePublication: LocalDateTime (default = now)
statut: Enum StatutOffre (NOT NULL, default = BROUILLON)
  → BROUILLON, ACTIVE, CLOTUREE, ARCHIVEE, SUSPENDUE
nombrePostes: Integer (default = 1)
publieurId: Long (NOT NULL) ← MS1
projetId: Long (nullable) ← MS2
categorie: Categorie (ManyToOne)
appelOffre: AppelOffre (OneToOne mappedBy)
criteres: List<Critere> (OneToMany mappedBy)
```

#### 3. AppelOffre (Appel d'offres formel)
```
id: Long (PK)
titre: String (NOT NULL, max 200)
description: String (TEXT)
dateOuverture: LocalDateTime (nullable)
dateCloture: LocalDateTime (NOT NULL)
budgetTotal: Double (nullable)
conditionsParticipation: String (TEXT)
documentsRequis: String (TEXT)
statut: Enum StatutAppelOffre (NOT NULL, default = OUVERT)
  → OUVERT, CLOTURE, ANNULE, ATTRIBUE
offre: Offre (OneToOne, FK)
```

#### 4. Critere (Critères de sélection)
```
id: Long (PK)
nom: String (NOT NULL, max 200)
description: String (TEXT)
poids: Integer (NOT NULL, min=0, max=100, default=10)
obligatoire: Boolean (NOT NULL, default = false)
type: Enum TypeCritere (default = COMPETENCE)
  → COMPETENCE, EXPERIENCE, DIPLOME, LANGUE, DISPONIBILITE, AUTRE
offre: Offre (ManyToOne, FK)
```

### Règles Métier

| Règle | Entité | Description |
|-------|--------|-------------|
| Deadline future | Offre | La deadline doit être dans le futur |
| Budget cohérent | Offre | budgetMax > budgetMin si présent |
| Critère avant publication | Offre | Au moins 1 critère obligatoire avant de publier |
| Poids maximum | Critere | Somme des poids ≤ 100% |
| Un seul AppelOffre | AppelOffre | Une offre = un seul appel d'offres |
| Modification restreinte | Offre | Modification uniquement si statut = BROUILLON |

### Pages Frontend Module 1

| Page | Type | Description | Entités |
|------|------|-------------|---------|
| **Page 1 - Marketplace** | Front | Grille offres, recherche, filtres | Offre, Categorie |
| **Page 2 - Créer Offre** | Front | Formulaire multi-étapes | Offre, Critere, AppelOffre |
| **Page 3 - Détail Offre** | Front | Vue complète + candidatures | Offre, Critere, Candidature |
| **Page 13 - Admin Dashboard** | Back | Vue globale, stats, modération | Offre, Candidature, Contrat |

---

## 📐 Plan de Développement

### Phase 1 : Backend Spring Boot (Module 1)
1. ✅ Créer projet Spring Boot
2. ✅ Configuration base de données (H2/MySQL)
3. ✅ Entités JPA (Categorie, Offre, AppelOffre, Critere)
4. ✅ Repositories
5. ✅ Services métier (avec validations)
6. ✅ REST Controllers
7. ✅ Tests API

### Phase 2 : Frontend Angular Adaptation
1. ✅ Analyser template Berry (home vs dashboard)
2. ✅ Configurer routing (Front Office / Back Office)
3. ✅ Services Angular (HTTP)
4. ✅ Composant Page 1 - Marketplace
5. ✅ Composant Page 2 - Créer Offre
6. ✅ Composant Page 3 - Détail Offre
7. ✅ Composant Page 13 - Admin Dashboard

### Phase 3 : Intégration
1. ✅ Connecter Frontend ↔ Backend
2. ✅ Tests end-to-end

---

## 🚀 Démarrage Immédiat

**COMMENCER PAR** : Créer le backend Spring Boot Module 1 avec les 4 entités et leurs relations.

Structure backend suggérée :
```
taib-backend/
├── src/main/java/com/taib/offres/
│   ├── entity/           # Categorie, Offre, AppelOffre, Critere
│   ├── repository/       # JPA Repositories
│   ├── service/          # Logique métier
│   ├── controller/       # REST API
│   ├── dto/              # Data Transfer Objects
│   ├── exception/        # Gestion erreurs
│   └── config/           # Configuration
└── src/main/resources/
    ├── application.yml
    └── data.sql          # Données initiales
```
