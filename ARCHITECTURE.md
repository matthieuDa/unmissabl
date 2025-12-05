# Architecture du Projet Noformat

## Vue d'ensemble
Noformat est un site web portfolio/agence de design stratégique avec un système de rendu 3D WebGL pour afficher un œil interactif. Le projet est construit avec jQuery, Three.js et WebGL.

---

## Structure Actuelle des Fichiers

```
noformat/
├── ARCHITECTURE.md                    # Ce fichier - Documentation de l'architecture
├── noformat.html                      # Page principale (HTML5)
│
├── Assets Visuels/
│   ├── Images de l'œil 3D:
│   │   ├── eye-normals1.png          # Texture des normales de l'œil
│   │   ├── eye-pattern.jpg           # Pattern de l'iris
│   │   ├── eye-pattern1.jpg          # Pattern alternatif
│   │   ├── refract.png               # Texture de réfraction (cornée)
│   │   ├── noise.png                 # Texture de bruit
│   │
│   └── Images de fond (parallax):
│       ├── bgr-happy-moves-layer-one.png
│       ├── bgr-happy-moves-layer-one.png
│       ├── bgr-pls-pls-me-layer-one.png
│       ├── bgr-pls-pls-me-layer-four.png
│       └── bgr-pls-pls-me-layer-five.png
│
├── Styles CSS/
│   ├── reset.css                      # Reset/normalisation CSS
│   ├── blog.css                       # Styles des articles de blog
│   ├── main.css                       # Styles principaux
│   ├── updates.css                    # Styles des mises à jour
│   ├── slick.css                      # CSS du carousel Slick
│   └── style.min.css                  # Styles minifiés
│
├── Bibliothèques Externes (Minifiées)/
│   ├── jquery.min.js                  # jQuery 1.11.0
│   ├── three.js                       # Three.js (WebGL library)
│   ├── slick.min.js                   # Slider/Carousel Slick
│   ├── modernizr.js                   # Feature detection
│   ├── particles.js                   # Animation de particules
│   ├── recorder.js                    # Enregistrement audio/vidéo (?)
│   │
│   └── Plugins jQuery:
│       ├── jquery.device.js           # Détection du device
│       ├── jquery.easing.min.js       # Easing animations
│       ├── jquery.fullpage.js         # Fullpage scrolling
│       ├── jquery.history.js          # Gestion historique
│       ├── jquery.isotope.min.js      # Layout grid/isotope
│       ├── jquery.parallax.js         # Effet parallax
│       ├── jquery.preloading.js       # Système de preloading
│       ├── jquery.scrolling.js        # Contrôle du scroll
│       ├── jquery.video.js            # Gestion des vidéos
│       └── jquery.vs.js               # Utilitaire custom
│
├── Shaders WebGL (Three.js)/
│   ├── RenderPass.js                  # Post-processing render pass
│   ├── ShaderPass.js                  # Post-processing shader pass
│   ├── EffectComposer.js              # Composition des effets
│   ├── CopyShader.js                  # Shader de copie
│   │
│   ├── BloomPass.js                   # Effet Bloom (luminosité)
│   ├── BloomPass.js                   # Effet Bloom
│   │
│   └── Blur Shaders:
│       ├── HorizontalBlurShader.js    # Flou horizontal
│       ├── VerticalBlurShader.js      # Flou vertical
│       └── LuminosityHighPassShader.js # High-pass pour bloom
│
├── Loaders 3D/
│   └── objloader.js                   # Chargeur de fichiers .OBJ (3D models)
│
├── Scripts Principaux/
│   ├── init.js                        # Script d'initialisation principal (2720 lignes)
│   ├── main.js                        # Code Cloudflare obfusqué (PROBLÉMATIQUE)
│   │
│   └── Extra Scripts/
│       ├── eye.js                     # Script de rendu 3D de l'œil (NOUVEAU - à optimiser)
│       └── main.js                    # Code Cloudflare obfusqué (doublé - PROBLÉMATIQUE)
│
├── Analytics & Services/
│   ├── gtm.js                         # Google Tag Manager
│   ├── insight.min.js                 # Analytics (Smartlook?)
│   └── Voir aussi noformat.html pour:
│       ├── Crazy Egg (heatmap)
│       ├── Smartlook (session recording)
│
├── Bundles Webpack (Minifiés)/
│   ├── bundle.3a0787f5092e11e9af33.js
│   ├── init.b73d31584012c4e7cab8.js
│   └── polyfills.94f10da5f29adce71910.js
│
└── Autres/
    ├── js                             # Fichier (contenu inconnu)
    └── .qodo/                         # Dossier Qodo (documentation IA ?)

```

---

## Analyse Détaillée des Composants

### 1. **Page HTML Principale** (`noformat.html`)
- **Type:** HTML5
- **Contenu:** 
  - Header avec navigation
  - Sections fullpage avec hero œil 3D
  - Contenu portfolio et services
  - Contact dialog
  - Shaders WebGL inlined pour l'œil (vertex & fragment)
  - Scripts de suivi Google Tag Manager, Smartlook, Crazy Egg

### 2. **Système de Rendu 3D de l'Œil**

#### Shaders WebGL (inlined dans HTML):
- **eyeVertexShader**: Transformations géométriques complexes de la cornée et de l'iris
- **eyeFragmentShader**: Rendu réaliste avec:
  - Textures (couleur, normales, patterns d'iris)
  - Réfraction de la cornée
  - Calcul d'éclairage avancé (Phong/PBR)
  - Effets de transparence

#### Script `Extra Scripts/eye.js`:
- **Statut:** NOUVEAU (créé pour remplacer le code Cloudflare cassé)
- **Fonction:** Initialiser le rendu Three.js et charger les shaders WebGL
- **Problèmes identifiés:**
  - Utilise un shader Phong basique au lieu des shaders réalistes du HTML
  - N'utilise pas les textures eye-normals1.png, eye-pattern.jpg, refract.png
  - Apparence visuelle différente du screenshot fourni

#### Textures Utilisées:
- `eye-normals1.png` - Map des normales pour le relief
- `eye-pattern.jpg` / `eye-pattern1.jpg` - Pattern d'iris
- `refract.png` - Réfraction cornéenne
- `noise.png` - Bruit pour détails

### 3. **Code Cloudflare Problématique**

#### `main.js` (à la racine) & `Extra Scripts/main.js`:
- **Type:** Code JavaScript obfusqué
- **Provenance:** Cloudflare challenge protection
- **Statut:** ⚠️ CRITIQUE - À SUPPRIMER
- **Problèmes:**
  - Code de protection Cloudflare conçu pour le site en ligne
  - Non fonctionnel en environnement local
  - Interfère avec le rendu de l'œil
  - Crée des challenges de vérification inutiles
  - Compromet la performance

**Action:** Ces fichiers ont été commentés dans noformat.html

### 4. **Framework JavaScript & Plugins**

#### jQuery Ecosystem (v1.11.0):
- Core jQuery pour DOM manipulation
- Plugins custom pour:
  - Fullpage scrolling (jquery.fullpage.js)
  - Parallax effects (jquery.parallax.js)
  - Image gallery (jquery.isotope.min.js)
  - Animations easing (jquery.easing.min.js)
  - Gestion de l'historique (jquery.history.js)

#### Three.js:
- Bibliothèque WebGL pour rendu 3D
- Utilisée pour l'œil et potentiellement d'autres éléments 3D

### 5. **Système de Preloading**

**Fichier:** `init.js` (2720 lignes)

**Fonctionnalités principales:**
- Preloading des assets (images, vidéos)
- Gestion du viewport et du responsive
- Contrôle des animations fullpage
- Gestion des events scroll/resize
- Détection des devices (mobile/desktop)

**Variables/Flags clés:**
- `eyeVisible` - État de visibilité de l'œil
- `noformat.windowW/H` - Dimensions fenêtre
- `noformat.scroll` - Position du scroll

### 6. **Post-Processing & Effets**

**Composers & Passes:**
- `EffectComposer.js` - Framework de composition d'effets
- `RenderPass.js` - Rendu initial
- `ShaderPass.js` - Application de shaders personnalisés
- `BloomPass.js` - Effet bloom/brillance

**Shaders de Flou:**
- `HorizontalBlurShader.js` - Flou sur axe X
- `VerticalBlurShader.js` - Flou sur axe Y
- `LuminosityHighPassShader.js` - Détection haute luminosité

---

## Problèmes Identifiés et Solutions

### 🔴 CRITIQUE

#### 1. Code Cloudflare Obfusqué
- **Localisation:** `main.js` (racine), `Extra Scripts/main.js`
- **Symptôme:** L'œil n'affiche pas les bonnes couleurs/textures
- **Cause:** Code de protection qui interfère avec le rendu
- **Solution:** ✅ **APPLIQUÉE** - Commenté dans HTML

#### 2. Script `eye.js` Incomplet
- **Localisation:** `Extra Scripts/eye.js`
- **Symptôme:** Œil trop simple, pas réaliste
- **Cause:** Shader basique, pas de textures
- **Solution:** À optimiser - utiliser les vrais shaders du HTML

### 🟡 MAJEUR

#### 3. Doublons de Fichiers
- `main.js` existe à 2 emplacements (racine + Extra Scripts)
- `init.js` + `init.b73d31584012c4e7cab8.js` (minifiés/bundlés)
- **Impact:** Confusion, maintenance difficile
- **Solution:** À nettoyer - voir section Réorganisation

#### 4. Architecture Désorganisée
- Fichiers CSS mélangés avec JS
- Assets visuels à la racine
- Bundles webpack non documentés
- **Impact:** Difficile à maintenir et comprendre
- **Solution:** Voir section Réorganisation proposée

---

## Réorganisation Proposée

### Nouvelle Structure Recommandée:

```
noformat/
├── index.html                          # Page principale (renommée de noformat.html)
│
├── src/
│   ├── styles/
│   │   ├── base/
│   │   │   ├── reset.css
│   │   │   └── typography.css
│   │   ├── components/
│   │   │   ├── header.css
│   │   │   ├── hero.css
│   │   │   └── contact.css
│   │   ├── vendor/
│   │   │   ├── slick.css
│   │   │   └── (autres CSS externes)
│   │   └── main.css                  # Orchestrateur
│   │
│   ├── scripts/
│   │   ├── vendor/
│   │   │   ├── jquery.min.js
│   │   │   ├── three.js
│   │   │   ├── jquery-plugins/
│   │   │   │   ├── fullpage.js
│   │   │   │   ├── parallax.js
│   │   │   │   └── ...
│   │   │   └── three-postprocessing/
│   │   │       ├── EffectComposer.js
│   │   │       ├── RenderPass.js
│   │   │       ├── ShaderPass.js
│   │   │       ├── BloomPass.js
│   │   │       └── shaders/
│   │   │           ├── BlurHorizontal.js
│   │   │           ├── BlurVertical.js
│   │   │           └── LuminosityHighPass.js
│   │   │
│   │   ├── core/
│   │   │   ├── init.js               # Initialisation principale
│   │   │   ├── utils.js              # Utilitaires
│   │   │   └── config.js             # Configuration
│   │   │
│   │   └── modules/
│   │       ├── eye-renderer.js       # Rendu œil 3D (optimisé)
│   │       ├── parallax.js           # Gestion parallax
│   │       ├── preloader.js          # Système preloading
│   │       ├── scroll-handler.js     # Gestion scroll/resize
│   │       └── analytics.js          # Analytics & tracking
│   │
│   └── shaders/
│       ├── eye-vertex.glsl           # Shader vertex extracté
│       ├── eye-fragment.glsl         # Shader fragment extracté
│       └── README.md                 # Documentation shaders
│
├── assets/
│   ├── images/
│   │   ├── eye/
│   │   │   ├── eye-normals1.png
│   │   │   ├── eye-pattern.jpg
│   │   │   ├── eye-pattern1.jpg
│   │   │   ├── refract.png
│   │   │   └── noise.png
│   │   │
│   │   └── backgrounds/
│   │       ├── happy-moves-layer-*.png
│   │       └── pls-pls-me-layer-*.png
│   │
│   └── models/                       # Si fichiers .OBJ existent
│       └── eye.obj (?)
│
├── dist/                             # Build output (bundles webpack)
│   ├── bundle.min.js
│   ├── styles.min.css
│   └── assets/
│
├── docs/
│   ├── ARCHITECTURE.md               # Ce fichier
│   ├── DEVELOPMENT.md                # Guide développement
│   └── SHADERS.md                    # Documentation shaders
│
├── .gitignore
├── webpack.config.js                 # Configuration build (si utilisé)
├── package.json                      # Dépendances npm (si utilisé)
└── README.md                         # Documentation générale
```

---

## Technologies Utilisées

| Technologie | Version | Purpose |
|-------------|---------|---------|
| jQuery | 1.11.0 | DOM manipulation, animations |
| Three.js | (unknown) | Rendu 3D WebGL |
| WebGL | 1.0 | Shaders eye réalistes |
| Slick | Latest | Carousel/Slider |
| Modernizr | Latest | Feature detection |
| Google Tag Manager | - | Analytics |
| Smartlook | - | Session recording |
| Crazy Egg | - | Heatmap analytics |

---

## Points d'Entrée & Initialisation

1. **HTML charge les librairies:**
   - jQuery
   - Three.js
   - Plugins jQuery
   - Shaders Three.js (EffectComposer, etc)

2. **init.js déclenche:**
   - Préloading des assets
   - Initialisation fullpage
   - Setup événements
   - Appels aux modules custom

3. **eye.js initialise:**
   - Création scène Three.js
   - Chargement shaders WebGL
   - Rendu œil 3D
   - Interaction souris

---

## Performance & Optimisation

### Bottlenecks Actuels:
- ❌ Code Cloudflare non-minifié et non-utilisé
- ❌ Scripts `eye.js` trop simplifié, pas optimisé
- ⚠️ Nombreuses librairies externes à la racine
- ⚠️ Texture eye non optimisées (formats JPG au lieu WebP)
- ⚠️ Pas de lazy-loading visible

### Recommandations:
1. ✅ Supprimer code Cloudflare
2. 🔄 Optimiser shaders eye.js pour utiliser vraies textures
3. 🔄 Minifier et bundler avec webpack
4. 🔄 Convertir images PNG/JPG en WebP
5. 🔄 Implémenter lazy-loading des backgrounds
6. 🔄 Utiliser service worker pour cache

---

## Dépendances Externes Déclarées

**Dans noformat.html:**
```html
<!-- CSS -->
<link href="main.css">
<link href="slick.css">
<link href="updates.css">
<link href="blog.css">

<!-- JS -->
<script src="jquery.min.js"></script>
<script src="three.js"></script>
<script src="shaders/RenderPass.js"></script>
... (18 fichiers JS)
<script src="init.js"></script>
<script src="Extra Scripts/eye.js"></script>
```

---

## Fichiers à Ignorer/Supprimer

- ❌ `main.js` (Cloudflare obfusqué)
- ❌ `Extra Scripts/main.js` (doublon)
- ⚠️ `.qodo/` (dossier IA - optionnel)
- ✅ `init.b73d31584012c4e7cab8.js` (bundle minifié)
- ✅ `polyfills.94f10da5f29adce71910.js` (bundle minifié)

---

## Fichiers à Conserver/Optimiser

- ✅ `noformat.html` - Page principale
- ✅ Tous les CSS
- ✅ jQuery + plugins (legacy mais fonctionnel)
- ✅ Three.js + shaders
- ✅ Textures eye
- ✅ Images backgrounds
- 🔄 `init.js` - À documenter et refactoriser
- 🔄 `Extra Scripts/eye.js` - À optimiser

---

## Notes pour le Développement

### Code Legacy:
- Projet basé sur jQuery (ancien style, post-2014)
- Pas de framework moderne (React/Vue)
- Shaders WebGL bien documentés avec commentaires
- Bon niveau de complexité technique

### Points Clés de Compréhension:
1. L'œil 3D est le héros visuel de la homepage
2. Le système de parallax est critique pour l'UX
3. Les shaders WebGL sont le cœur du rendu réaliste
4. Le preloading est important pour une bonne perception de performance

### Ressources Utiles:
- Three.js docs: https://threejs.org/docs/
- WebGL shaders guide: https://learnopengl.com/
- jQuery plugins documentation individuelles

---

## Prochain Étapes Recommandées

1. ✅ Supprimer code Cloudflare (FAIT)
2. 🔄 Optimiser `eye.js` pour utiliser les vrais shaders du HTML
3. 🔄 Réorganiser la structure des fichiers
4. 🔄 Documenter les shaders WebGL
5. 🔄 Créer fichier de configuration centralisé
6. 🔄 Mettre en place build process (webpack/vite)
7. 🔄 Optimiser images (WebP, compression)
8. 🔄 Moderniser jQuery → vanilla JS (graduel)

---

**Document créé le:** 5 Décembre 2025  
**Version:** 1.0  
**Statut:** Analyse complète du répertoire noformat
