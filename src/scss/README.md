# Dossier scss/

Ce dossier contient tous les styles SCSS globaux de l'application.

## 📂 Structure

```
scss/
├── bootstrap/          # Styles Bootstrap personnalisés
├── fonts/              # Fichiers de polices et définitions
├── settings/           # Variables et paramètres SCSS
├── themes/             # Thèmes de couleurs différents
└── style-preset.scss   # Présélection de styles globaux
```

## 📁 Sous-dossiers

### bootstrap/
Contient les personnalisations de Bootstrap 5 :
- Overrides des variables Bootstrap
- Styles personnalisés pour les composants Bootstrap

### fonts/
Contient :
- Fichiers de polices (.woff, .woff2, .ttf)
- Définitions @font-face
- Variables de polices

### settings/
Contient :
- Variables globales de couleurs
- Variables d'espacement
- Variables de typographie
- Mixins SCSS réutilisables

### themes/
Contient les différents thèmes de couleurs :
- Thème par défaut
- Variantes de couleurs
- Thèmes clairs/sombres (si disponibles)

## 🎨 Personnalisation

Pour personnaliser les styles globaux :
1. Modifiez les variables dans `settings/`
2. Ajoutez vos styles dans `style-preset.scss`
3. Pour créer un nouveau thème, copiez un thème existant dans `themes/` et modifiez les couleurs

## 📦 Importation

Les styles sont importés dans `src/styles.scss` qui est le point d'entrée principal des styles globaux.
