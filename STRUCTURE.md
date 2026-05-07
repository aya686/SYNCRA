# Structure du Projet Berry Angular

Ce document explique l'organisation des fichiers et dossiers du projet Berry Free Angular Admin Template.

## 📁 Structure Racine

```
templatetest/
├── 📄 Configuration
│   ├── angular.json           # Configuration principale Angular
│   ├── tsconfig.json          # Configuration TypeScript
│   ├── tsconfig.app.json      # Configuration TypeScript pour l'application
│   ├── tsconfig.spec.json     # Configuration TypeScript pour les tests
│   ├── .prettierrc            # Configuration du formateur de code Prettier
│   ├── eslint.config.mjs      # Configuration du linter ESLint
│   ├── .browserslistrc        # Liste des navigateurs supportés
│   ├── .editorconfig          # Configuration de l'éditeur de code
│   └── .gitignore             # Fichiers ignorés par Git
│
├── 📦 Dépendences
│   ├── package.json           # Liste des dépendances et scripts npm
│   ├── package-lock.json      # Lockfile des versions npm
│   └── yarn.lock              # Lockfile des versions yarn
│
├── 📚 Documentation
│   ├── README.md              # Documentation principale (anglais)
│   ├── LICENSE                # Licence MIT
│   └── STRUCTURE.md           # Ce fichier - structure en français
│
├── 🔄 GitHub
│   └── .github/               # Configuration GitHub (workflows, etc.)
│
└── 📂 src/                    # Code source de l'application
```

## 📂 Dossier src/

```
src/
├── app/                       # Application Angular principale
│   ├── demo/                  # Pages de démonstration et exemples
│   │   ├── admin-panel/       # Exemples de panneau d'administration
│   │   ├── application/       # Exemples d'applications
│   │   ├── chart-maps/        # Graphiques et cartes
│   │   ├── dashboard/         # Tableaux de bord
│   │   ├── elements/          # Composants UI élémentaires
│   │   ├── forms/             # Formulaires
│   │   ├── layout/            # Exemples de layouts
│   │   ├── other/             # Autres composants
│   │   ├── pages/             # Pages complètes (login, register, etc.)
│   │   ├── tables/            # Tableaux de données
│   │   └── widget/            # Widgets
│   │
│   ├── theme/                 # Thème et composants partagés
│   │   ├── layout/            # Composants de layout (header, sidebar, footer)
│   │   └── shared/            # Composants et services partagés
│   │
│   ├── app.component.html     # Template du composant racine
│   ├── app.component.scss     # Styles du composant racine
│   ├── app.component.ts       # Logique du composant racine
│   ├── app-routing.module.ts  # Configuration des routes
│   └── app-config.ts          # Configuration de l'application
│
├── assets/                    # Ressources statiques
│   ├── images/                # Images
│   └── ...                    # Autres assets
│
├── scss/                      # Styles SCSS globaux
│   ├── bootstrap/             # Styles Bootstrap personnalisés
│   ├── fonts/                 # Fichiers de polices
│   ├── settings/              # Variables et paramètres SCSS
│   ├── themes/                # Thèmes de couleurs
│   └── style-preset.scss      # Présélection de styles
│
├── environments/              # Configurations d'environnement
│   ├── environment.ts         # Environnement de développement
│   └── environment.prod.ts    # Environnement de production
│
├── fake-data/                 # Données de test/mock
│
├── main.ts                    # Point d'entrée de l'application
├── index.html                 # Page HTML principale
├── styles.scss                # Styles globaux
└── favicon.ico                # Icône du site
```

## 🎯 Points d'Entrée Principaux

1. **main.ts** - Point d'entrée de l'application Angular
2. **app.component.ts** - Composant racine de l'application
3. **app-routing.module.ts** - Configuration des routes/navigation
4. **index.html** - Template HTML principal

## 🚀 Scripts Disponibles

- `npm start` ou `ng serve` - Lance le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run build-prod` - Construction optimisée pour la production
- `npm test` - Exécute les tests
- `npm run lint` - Vérifie le code avec ESLint
- `npm run prettier` - Formate le code avec Prettier

## 📦 Technologies Utilisées

- **Angular 21** - Framework frontend
- **Bootstrap 5** - Framework CSS
- **TypeScript** - Langage de programmation
- **ApexCharts** - Bibliothèque de graphiques
- **ng-bootstrap** - Composants Bootstrap pour Angular

## 💡 Conseils de Navigation

- Pour modifier le layout principal, regardez dans `src/app/theme/layout/`
- Pour ajouter une nouvelle page, créez un composant dans `src/app/demo/` ou `src/app/`
- Pour personnaliser les styles, modifiez les fichiers dans `src/scss/`
- Les routes sont configurées dans `src/app/app-routing.module.ts`

## 🔄 Flux de Données

1. L'utilisateur navigue vers une URL
2. Le router Angular (`app-routing.module.ts`) détermine quel composant afficher
3. Le composant charge ses données depuis les services ou fake-data
4. Le template HTML affiche les données avec les styles SCSS
