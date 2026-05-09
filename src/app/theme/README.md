# Dossier theme/

Ce dossier contient les composants partagés et le layout de l'application.

## 📂 Structure

```
theme/
├── layout/            # Composants de layout principal
└── shared/            # Services et composants partagés
```

## 📁 Sous-dossiers

### layout/
Contient les composants structurels de l'application :
- **Header** : Barre de navigation supérieure
- **Sidebar** : Menu latéral de navigation
- **Footer** : Pied de page
- **Navigation** : Composant de navigation
- **Customizer** : Personnalisateur de thème (si disponible)

Ces composants définissent la structure visuelle de base de l'application.

### shared/
Contient les éléments réutilisables dans toute l'application :
- **Services** : Services HTTP, services de données
- **Directives** : Directives Angular personnalisées
- **Pipes** : Pipes Angular pour le formatage
- **Components** : Composants génériques réutilisables
- **Models** : Interfaces et types TypeScript
- **Constants** : Constantes globales

## 🎯 Points d'Intérêt

### Modifier le Layout
Pour personnaliser le layout :
1. Modifiez les composants dans `layout/`
2. Ajustez les styles dans `src/scss/`
3. Modifiez la configuration dans `src/app/app-config.ts`

### Services Partagés
Les services dans `shared/` sont injectables et utilisables dans n'importe quel composant :
```typescript
import { VotreService } from '../theme/shared/services/votre.service';
```

### Composants Partagés
Les composants dans `shared/` peuvent être réutilisés dans toute l'application :
```typescript
import { VotreComposant } from '../theme/shared/components/votre-composant';
```

## 💡 Bonnes Pratiques

- Placez ici uniquement le code qui est utilisé par plusieurs parties de l'application
- Les composants spécifiques à une page devraient être dans le dossier `demo/` ou directement dans `app/`
- Gardez les services simples et focussés sur une responsabilité unique
