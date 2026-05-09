# Dossier assets/

Ce dossier contient toutes les ressources statiques de l'application.

## 📂 Types de Ressources

```
assets/
├── images/            # Images (logos, icônes, illustrations)
├── fonts/             # Fichiers de polices (si nécessaires)
├── icons/             # Icônes SVG
└── ...                # Autres ressources statiques
```

## 💡 Utilisation

Les fichiers de ce dossier sont accessibles directement dans l'application via le chemin relatif :
- Dans un template HTML : `src="/assets/images/logo.png"`
- Dans un fichier SCSS : `url('/assets/images/background.jpg')`

## 📤 Ajout de Nouvelles Ressources

Pour ajouter une nouvelle ressource :
1. Placez le fichier dans le sous-dossier approprié
2. Référencez-le dans votre composant ou fichier de style

## ⚠️ Note

Les fichiers dans ce dossier sont inclus dans le build de production. Évitez d'y mettre des fichiers trop volumineux ou non utilisés.
