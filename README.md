# Unmissabl - 3D Eye Project

A WebGL-based 3D eye visualization using Three.js with post-processing effects.

## Project Structure

```
unmissabl/
├── public/               # Static assets and entry HTML
│   ├── images/          # Eye textures and background images
│   ├── libs/            # Third-party JavaScript libraries
│   ├── shaders/         # GLSL shader files (if any)
│   └── index.html       # Main entry point
├── src/                 # Source code
│   ├── core/            # Three.js and core 3D functionality
│   │   ├── three.js     # Three.js library
│   │   └── objloader.js # OBJ model loader
│   ├── effects/         # Post-processing effects
│   │   ├── EffectComposer.js
│   │   ├── RenderPass.js
│   │   ├── ShaderPass.js
│   │   ├── BloomPass.js
│   │   ├── CopyShader.js
│   │   ├── LuminosityHighPassShader.js
│   │   ├── HorizontalBlurShader.js
│   │   └── VerticalBlurShader.js
│   ├── eye/             # Eye-specific logic
│   │   ├── eye.js       # Eye geometry and materials
│   │   └── main.js      # Eye animation and controls
│   ├── ui/              # User interface and interactions
│   │   └── init.js      # Application initialization
│   └── styles/          # CSS stylesheets
│       ├── base/        # Base/reset styles
│       ├── main.css     # Main stylesheet
│       ├── style.min.css
│       ├── updates.css
│       ├── blog.css
│       └── slick.css
├── dist/                # Generated/bundled files (ignored by git)
│   ├── bundle.*.js
│   ├── polyfills.*.js
│   └── init.*.js
├── .gitignore           # Git ignore rules
└── ARCHITECTURE.md      # Detailed architecture documentation
```

## Getting Started

1. Open `public/index.html` in a web browser
2. The 3D eye should render with interactive effects

## Development

The project uses vanilla JavaScript with Three.js for 3D rendering. No build process is currently required.

### Key Files

- **public/index.html** - Entry point that loads all scripts and defines eye shaders
- **src/ui/init.js** - Initializes the application and sets up the scene
- **src/eye/eye.js** - Eye-specific Three.js setup
- **src/core/three.js** - Three.js library
- **src/effects/** - Post-processing shader effects

## Assets

Images are located in `public/images/`:
- `eye-pattern.jpg`, `eye-pattern1.jpg` - Eye color textures
- `eye-normals1.png` - Normal map for the eye
- `refract.png` - Refraction texture
- `noise.png` - Noise texture
- `bgr-*.png` - Background layer images

## Notes

- The project was reorganized from a WordPress theme structure to a cleaner, more modular layout
- All file paths have been updated to reflect the new structure
- Generated bundles and build artifacts are now in `dist/` and ignored by git
