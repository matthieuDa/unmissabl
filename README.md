# Unmissabl - 3D Eye Application

## Structure du Projet

Le projet a été réorganisé avec une nouvelle arborescence claire :

```
unmissabl/
├── public/              # Ressources publiques statiques
│   ├── index.html       # Page principale
│   ├── images/          # Assets visuels
│   └── libs/            # Bibliothèques tierces
├── src/                 # Code source
│   ├── core/            # Scripts principaux
│   ├── effects/         # Shaders WebGL
│   ├── eye/             # Logique de l'œil 3D
│   ├── styles/          # Feuilles de style
│   └── ui/              # Scripts UI
└── dist/                # Bundles générés (ignorés par Git)
```

## Comment Exécuter l'Application

### Méthode 1: Python HTTP Server (Recommandé pour le développement)

```bash
# Depuis la racine du projet
python3 -m http.server 8080

# Ou pour Python 2
python -m SimpleHTTPServer 8080
```

Puis ouvrez votre navigateur à : http://localhost:8080/public/index.html

### Méthode 2: npx serve

```bash
# Depuis la racine du projet
npx serve

# Puis naviguez vers /public/index.html
```

### Méthode 3: Serveur web (Production)

Pour un déploiement en production, configurez votre serveur web (Apache, Nginx, etc.) pour servir depuis la racine du projet avec :
- Document root : racine du projet
- Point d'entrée : `/public/index.html`

## Changements de Chemins

### Avant
- `noformat.html` → Maintenant : `public/index.html`
- Images à la racine → Maintenant : `public/images/`
- Scripts à la racine → Maintenant : `src/core/`, `src/effects/`, `src/eye/`
- CSS à la racine → Maintenant : `src/styles/`

### Chemins mis à jour dans le code
- Tous les chemins dans `public/index.html` ont été mis à jour
- Tous les chemins dans `src/core/init.js` ont été mis à jour
- Variable `themeUrl` mise à jour pour pointer vers `..`

## Fonctionnalités

- Rendu 3D d'un œil réaliste avec Three.js
- Post-processing avec Bloom effect
- Animations parallax
- Interface responsive
- Intégrations analytics (GTM, Smartlook, Crazy Egg)

## Technologies

- Three.js pour le rendu 3D WebGL
- jQuery pour les interactions UI
- Shaders GLSL personnalisés pour l'œil
- Post-processing effects (Bloom, Blur)

## Notes de Migration

Cette version réorganise complètement la structure du dépôt pour une meilleure maintenabilité :
- Séparation claire entre ressources publiques et code source
- Regroupement logique des fichiers par fonction
- Structure modulaire pour faciliter les futures améliorations
- `.gitignore` ajouté pour ignorer les fichiers générés

### Fonts manquantes
Les fichiers de polices référencés dans les CSS (`MaisonNeueWEB-*.woff2`) ne sont pas présents dans le dépôt. 
Ces polices sont probablement servies depuis le site WordPress original. Pour un déploiement complet :
- Soit ajouter les fichiers de polices dans `public/fonts/`
- Soit mettre à jour les chemins dans `src/styles/main.css` et `src/styles/blog.css` pour pointer vers les polices hébergées
- Les chemins actuels pointent vers `../fonts/` (relatif depuis src/styles/), ce qui nécessiterait `public/fonts/`
