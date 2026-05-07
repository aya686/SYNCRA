# Dossier app/

Ce dossier contient le code principal de l'application Angular.

## 📂 Structure

```
app/
├── demo/              # Pages de démonstration et exemples
├── theme/             # Composants de thème et layout partagés
├── app.component.*    # Composant racine de l'application
├── app-routing.module.ts  # Configuration des routes
└── app-config.ts      # Configuration globale de l'application
```

## 📁 Sous-dossiers

### demo/
Contient toutes les pages de démonstration organisées par catégorie :
- **admin-panel/** : Exemples de panneaux d'administration
- **application/** : Applications complètes (email, chat, etc.)
- **chart-maps/** : Graphiques et cartes interactifs
- **dashboard/** : Différents tableaux de bord
- **elements/** : Composants UI de base (boutons, cartes, etc.)
- **forms/** : Exemples de formulaires
- **layout/** : Exemples de layouts
- **other/** : Autres composants utilitaires
- **pages/** : Pages complètes (login, register, erreur 404, etc.)
- **tables/** : Tableaux de données
- **widget/** : Widgets réutilisables

### theme/
Contient les composants partagés et le layout :
- **layout/** : Header, sidebar, footer, navigation
- **shared/** : Services, directives, pipes, composants partagés

## 🎯 Fichiers Principaux

- **app.component.ts** : Composant racine qui initialise l'application
- **app-routing.module.ts** : Définit toutes les routes de l'application
- **app-config.ts** : Configuration globale (menus, paramètres, etc.)

## 💡 Comment Ajouter une Nouvelle Page

1. Créer un nouveau composant dans le dossier approprié (demo/ ou directement dans app/)
2. Ajouter la route dans `app-routing.module.ts`
3. Ajouter l'entrée dans le menu (si nécessaire) dans `app-config.ts`
