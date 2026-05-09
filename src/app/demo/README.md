# Dossier demo/

Ce dossier contient toutes les pages de démonstration et exemples de l'application.

## 📂 Structure par Catégorie

```
demo/
├── admin-panel/       # Exemples de panneaux d'administration
├── application/       # Applications complètes (email, chat, calendar)
├── chart-maps/        # Graphiques et cartes interactifs
├── dashboard/         # Différents tableaux de bord
├── elements/          # Composants UI de base
├── forms/             # Exemples de formulaires
├── layout/            # Exemples de layouts
├── other/             # Autres composants utilitaires
├── pages/             # Pages complètes (auth, erreur)
├── tables/            # Tableaux de données
└── widget/            # Widgets réutilisables
```

## 📁 Détails des Catégories

### admin-panel/
Exemples de panneaux d'administration avec :
- Gestion des utilisateurs
- Statistiques
- Tableaux de bord admin

### application/
Applications complètes et fonctionnelles :
- **Email** : Client de messagerie
- **Chat** : Application de chat
- **Calendar** : Calendrier interactif
- **Kanban** : Tableau Kanban
- **Ecommerce** : Boutique en ligne

### chart-maps/
Visualisations de données :
- Graphiques ApexCharts
- Cartes interactives
- Diagrammes divers

### dashboard/
Différents types de tableaux de bord :
- Dashboard par défaut
- Dashboard analytics
- Dashboard sales
- etc.

### elements/
Composants UI de base :
- Alertes
- Boutons
- Cartes
- Badges
- Modals
- Accordions
- Tabs
- etc.

### forms/
Exemples de formulaires :
- Formulaires basiques
- Formulaires avancés
- Validation
- Wizards

### layout/
Exemples de layouts :
- Layout horizontal
- Layout vertical
- Layout boxed
- etc.

### other/
Composants utilitaires divers :
- Timeline
- Pricing
- FAQ
- etc.

### pages/
Pages complètes de l'application :
- Login
- Register
- Forgot Password
- Error 404
- Error 500
- Maintenance
- Coming Soon

### tables/
Tableaux de données :
- Tableaux basiques
- Tableaux avec tri
- Tableaux avec pagination
- Tableaux avancés

### widget/
Widgets réutilisables :
- Widgets statistiques
- Widgets météo
- Widgets de cartes
- etc.

## 💡 Utilisation

Chaque sous-dossier contient des composants Angular prêts à l'emploi. Vous pouvez :
1. Copier un composant existant comme point de départ
2. Modifier le selon vos besoins
3. L'intégrer dans votre application

## 🚀 Comment Créer une Nouvelle Page

1. Choisissez la catégorie appropriée ou créez un nouveau dossier
2. Générez un nouveau composant : `ng generate component demo/votre-nouvelle-page`
3. Ajoutez la route dans `src/app/app-routing.module.ts`
4. Ajoutez l'entrée dans le menu dans `src/app/app-config.ts`
