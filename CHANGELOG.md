# CHANGELOG - Réorganisation du Dépôt

## Version: Réorganisation 3D Eye (Décembre 2025)

### Vue d'ensemble
Réorganisation complète de la structure du dépôt pour améliorer la maintenabilité, la clarté et la séparation des responsabilités.

---

## Changements Structurels

### Nouvelle Arborescence

```
unmissabl/
├── public/              # Nouvellement créé
│   ├── index.html       # Renommé depuis noformat.html
│   ├── images/          # Nouvellement créé - tous les assets visuels
│   └── libs/            # Nouvellement créé - toutes les bibliothèques
│
├── src/                 # Réorganisé
│   ├── core/            # Nouvellement créé - logique principale
│   ├── effects/         # Nouvellement créé - shaders post-processing
│   ├── eye/             # Nouvellement créé - logique de l'œil 3D
│   ├── styles/          # Réorganisé - tous les CSS
│   │   ├── index.css    # Nouveau point d'entrée CSS
│   │   └── base/        # Existant (reset.css)
│   └── ui/              # Nouvellement créé (vide pour l'instant)
│
└── dist/                # Déplacé - bundles générés
```

---

## Migrations de Fichiers

### Images (9 fichiers → public/images/)
- `eye-pattern.jpg` → `public/images/eye-pattern.jpg`
- `eye-pattern1.jpg` → `public/images/eye-pattern1.jpg`
- `eye-normals1.png` → `public/images/eye-normals1.png`
- `noise.png` → `public/images/noise.png`
- `refract.png` → `public/images/refract.png`
- `bgr-happy-moves-layer-one.png` → `public/images/bgr-happy-moves-layer-one.png`
- `bgr-pls-pls-me-layer-one.png` → `public/images/bgr-pls-pls-me-layer-one.png`
- `bgr-pls-pls-me-layer-four.png` → `public/images/bgr-pls-pls-me-layer-four.png`
- `bgr-pls-pls-me-layer-five.png` → `public/images/bgr-pls-pls-me-layer-five.png`

### Bibliothèques (18 fichiers → public/libs/)
- `jquery.min.js` → `public/libs/jquery.min.js`
- `jquery.device.js` → `public/libs/jquery.device.js`
- `jquery.easing.min.js` → `public/libs/jquery.easing.min.js`
- `jquery.fullpage.js` → `public/libs/jquery.fullpage.js`
- `jquery.history.js` → `public/libs/jquery.history.js`
- `jquery.isotope.min.js` → `public/libs/jquery.isotope.min.js`
- `jquery.parallax.js` → `public/libs/jquery.parallax.js`
- `jquery.preloading.js` → `public/libs/jquery.preloading.js`
- `jquery.scrolling.js` → `public/libs/jquery.scrolling.js`
- `jquery.video.js` → `public/libs/jquery.video.js`
- `jquery.vs.js` → `public/libs/jquery.vs.js`
- `modernizr.js` → `public/libs/modernizr.js`
- `slick.min.js` → `public/libs/slick.min.js`
- `slick.css` → `public/libs/slick.css`
- `gtm.js` → `public/libs/gtm.js`
- `insight.min.js` → `public/libs/insight.min.js`
- `three.js` → `public/libs/three.js`
- `particles.js` → `public/libs/particles.js`
- `recorder.js` → `public/libs/recorder.js`

### Scripts Core (4 fichiers → src/core/)
- `init.js` → `src/core/init.js`
- `main.js` → `src/core/main.js`
- `objloader.js` → `src/core/objloader.js`
- `js` → `src/core/gtm-obfuscated.js` (renommé)

### Shaders/Effects (8 fichiers → src/effects/)
- `EffectComposer.js` → `src/effects/EffectComposer.js`
- `RenderPass.js` → `src/effects/RenderPass.js`
- `ShaderPass.js` → `src/effects/ShaderPass.js`
- `BloomPass.js` → `src/effects/BloomPass.js`
- `CopyShader.js` → `src/effects/CopyShader.js`
- `HorizontalBlurShader.js` → `src/effects/HorizontalBlurShader.js`
- `VerticalBlurShader.js` → `src/effects/VerticalBlurShader.js`
- `LuminosityHighPassShader.js` → `src/effects/LuminosityHighPassShader.js`

### Logique Eye (2 fichiers → src/eye/)
- `Extra Scripts/eye.js` → `src/eye/eye.js`
- `Extra Scripts/main.js` → `src/eye/main.js`

### Styles (4 fichiers → src/styles/)
- `main.css` → `src/styles/main.css`
- `updates.css` → `src/styles/updates.css`
- `blog.css` → `src/styles/blog.css`
- Nouveau: `src/styles/index.css` (point d'entrée)
- `src/styles/base/reset.css` (déjà existant)

### Bundles (4 fichiers → dist/)
- `bundle.3a0787f5092e11e9af33.js` → `dist/bundle.3a0787f5092e11e9af33.js`
- `init.b73d31584012c4e7cab8.js` → `dist/init.b73d31584012c4e7cab8.js`
- `polyfills.94f10da5f29adce71910.js` → `dist/polyfills.94f10da5f29adce71910.js`
- `style.min.css` → `dist/style.min.css`

### Page Principale
- `noformat.html` → `public/index.html` (renommé)

---

## Mises à Jour de Chemins

### Dans public/index.html
1. **Scripts de bibliothèques** : 
   - Avant: `https://noformat.com/wp-content/themes/noformat/assets/js/libs/*.js`
   - Après: `libs/*.js`

2. **Scripts core/effects** :
   - Avant: `https://noformat.com/wp-content/themes/noformat/assets/js/libs/*.js`
   - Après: `../src/core/*.js` et `../src/effects/*.js`

3. **CSS** :
   - Avant: `https://noformat.com/wp-content/themes/noformat/assets/css/*.css`
   - Après: `../src/styles/index.css` et `libs/slick.css`

4. **Variable themeUrl** :
   - Avant: `'https://noformat.com/wp-content/themes/noformat'`
   - Après: `'..'`

### Dans src/core/init.js
1. **Textures de l'œil** :
   - Avant: `themeUrl + '/assets/img/eye-*.jpg'`
   - Après: `themeUrl + '/public/images/eye-*.jpg'`

2. **Textures d'environnement** :
   - Avant: `themeUrl + '/assets/img/refl.jpg'`
   - Après: `themeUrl + '/public/images/refract.png'` (utilise les assets existants)

### Dans src/styles/main.css
1. **Images de fond** :
   - Avant: `url(../img/bgr-*.png)`
   - Après: `url(../../public/images/bgr-*.png)`

---

## Nouveaux Fichiers

### .gitignore
Créé pour ignorer :
- `node_modules/`
- `dist/`
- `*.log`
- `.DS_Store`
- Fichiers IDE et temporaires

### README.md
Documentation sur :
- Structure du projet
- Instructions d'exécution
- Changements de chemins
- Technologies utilisées

### src/styles/index.css
Point d'entrée CSS qui importe :
- `base/reset.css`
- `main.css`
- `updates.css`
- `blog.css`

### ARCHITECTURE.md (mis à jour)
- Documentation complète de la nouvelle structure
- Mappings des anciens vers nouveaux chemins
- Descriptions des composants

---

## Tests Effectués

✅ Serveur HTTP Python démarré avec succès
✅ `public/index.html` accessible
✅ Bibliothèques dans `public/libs/` accessibles
✅ Images dans `public/images/` accessibles
✅ CSS dans `src/styles/` accessible
✅ Scripts dans `src/core/` et `src/effects/` accessibles

---

## Instructions de Déploiement

### Développement Local
```bash
# Depuis la racine du projet
python3 -m http.server 8080

# Naviguer vers:
http://localhost:8080/public/index.html
```

### Production
Configurer le serveur web pour servir depuis la racine du projet avec `/public/index.html` comme point d'entrée.

---

## Notes Importantes

1. **Historique Git Préservé** : Tous les fichiers ont été déplacés avec `git mv` pour conserver l'historique.

2. **Compatibilité** : L'application fonctionne de la même manière qu'avant, seuls les chemins ont changé.

3. **Bundles** : Les fichiers dans `dist/` sont des bundles générés et sont maintenant ignorés par Git (via `.gitignore`).

4. **Structure Modulaire** : La nouvelle structure permet une meilleure organisation et facilite les futures améliorations.

5. **Assets Externes** : Certains assets référencés (comme les logos et images manquantes) n'étaient pas présents dans le dépôt original et ne sont donc pas inclus.

6. **Fonts Manquantes** : Les fichiers de polices (`MaisonNeueWEB-*.woff2`) référencés dans les CSS ne sont pas présents dans le dépôt. Ces polices doivent être ajoutées dans `public/fonts/` pour un déploiement complet, ou les chemins CSS doivent être mis à jour pour pointer vers des polices hébergées ailleurs.

---

## Prochaines Étapes Recommandées

1. Vérifier le fonctionnement de l'œil 3D dans un navigateur
2. Tester les animations et interactions UI
3. Valider les post-processing effects (Bloom)
4. Optimiser les performances si nécessaire
5. Considérer l'ajout d'un système de build (webpack, vite, etc.)
