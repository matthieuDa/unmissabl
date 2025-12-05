// Eye 3D rendering with Three.js - Realistic rendering
(function() {
    function initEye() {
        const outerEyeContainer = document.getElementById('outer-eye');
        
        if (!outerEyeContainer) return;
        
        // Wait for Three.js to be loaded
        if (typeof THREE === 'undefined') {
            setTimeout(initEye, 100);
            return;
        }
        
        // Dynamically import EffectComposer and passes (for post-processing)
        // We'll add shim in HTML or use the existing effects in public/libs
        const EffectComposer = window.THREE.EffectComposer || window.EffectComposer;
        const RenderPass = window.THREE.RenderPass || window.RenderPass;
        const UnrealBloomPass = window.THREE.UnrealBloomPass || window.UnrealBloomPass;
        const ShaderPass = window.THREE.ShaderPass || window.ShaderPass;
        const FXAAShader = window.THREE.FXAAShader || window.FXAAShader;
        
        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        
        // Get container dimensions
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 2.2;
        
        // Create renderer with proper settings
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            precision: 'highp',
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1.1;
        outerEyeContainer.appendChild(renderer.domElement);
        
        // Create eye geometry with high resolution
        const eyeGeometry = new THREE.SphereGeometry(1, 256, 256);
        
        // Procedural textures (generate once)
        const texGen = (window.textureGenerators || {});
        const texSize = 2048;
        const heightCanvas = texGen.genIrisCanvas ? texGen.genIrisCanvas(texSize) : null;
        let irisTex = heightCanvas ? new THREE.CanvasTexture(heightCanvas) : null;
        if (irisTex) { irisTex.encoding = THREE.sRGBEncoding; irisTex.needsUpdate = true; irisTex.wrapS = irisTex.wrapT = THREE.RepeatWrapping; }
        const normalCanvas = (texGen.genNormalFromHeightCanvas && heightCanvas) ? texGen.genNormalFromHeightCanvas(heightCanvas, 3.0) : null;
        let normalTex = normalCanvas ? new THREE.CanvasTexture(normalCanvas) : null;
        if (normalTex) { normalTex.format = THREE.RGBAFormat; normalTex.needsUpdate = true; normalTex.wrapS = normalTex.wrapT = THREE.RepeatWrapping; }
        let ringTex = texGen.genRingCanvas ? new THREE.CanvasTexture(texGen.genRingCanvas(1024)) : null;
        if (ringTex) { ringTex.needsUpdate = true; ringTex.wrapS = ringTex.wrapT = THREE.RepeatWrapping; }
        let grainTex = texGen.genGrainCanvas ? new THREE.CanvasTexture(texGen.genGrainCanvas(1024, 0.12)) : null;
        if (grainTex) { grainTex.needsUpdate = true; grainTex.wrapS = grainTex.wrapT = THREE.RepeatWrapping; }

        // Create custom shader for realistic eye
        const eyeMaterial = new THREE.ShaderMaterial({
            vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vViewDir;
            varying vec2 vUv;
                
                uniform float iris_size;
                uniform float cornea_bump_amount;
                uniform float cornea_bump_radius_mult;
                
                void main() {
                    vec3 pos = position;
                    float iris_depth = 1.0 - pow(iris_size, 3.0);
                    vec3 norm = normalize(pos);
                uniform float time;
                    
                    // Cornea bump
                    if (norm.z > 0.0) {
                        float iris_rad = sqrt(max(0.0, 1.0 - iris_depth * iris_depth));
                        float bump_t = min(1.0, sqrt(max(0.0, 1.0 - norm.z * norm.z)) / (iris_rad * cornea_bump_radius_mult));
                        float bump_factor = pow(1.0 - pow(bump_t, 2.5), 1.0);
                        bump_factor *= cornea_bump_amount * iris_rad;
                        pos += norm * bump_factor;
                    }
                    
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = pos;
                    vViewDir = normalize(cameraPosition - (modelMatrix * vec4(pos, 1.0)).xyz);
                    vUv = uv;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vViewDir;
                varying vec2 vUv;

                uniform float pupil_size;
                uniform float iris_size;
                uniform float iris_border;
                uniform float ior;
                uniform float alpha_intensity;
                uniform sampler2D irisMap;
                uniform sampler2D irisNormalMap;
                    // Iris color from generated texture with realistic tone-mapping
                    vec3 irisCol = vec3(0.25, 0.45, 0.65);
                
                float hash(float n) {
                        // Always use texture color (generated procedurally)
                        if (length(tex) > 0.01) {
                            irisCol = tex.rgb * 1.2; // slight brightening for realism
                        } else {
                }
                            irisCol = mix(vec3(0.15, 0.25, 0.4), vec3(0.5, 0.7, 0.9), noiseCol);
                            irisCol *= (1.0 + noiseCol * 0.25);
                    vec3 p = floor(x);
                    vec3 f = fract(x);
                    f = f * f * (3.0 - 2.0 * f);
                    // Pupil (very dark, almost black with slight blue tint)
                    vec3 pupilCol = vec3(0.01, 0.01, 0.02);
                        mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                        pupilCol = vec3(0.005, 0.005, 0.015);
                        mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                            mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
                    // Sclera (white of the eye) with blood vessel texture
                    vec3 scleraCol = vec3(0.94, 0.94, 0.95);
                void main() {
                    vec3 N = normalize(vNormal);
                        scleraCol = mix(vec3(0.90, 0.92, 0.93), vec3(0.85, 0.87, 0.92), bloodVessels * 0.08);
                    
                    // Calculate iris/pupil position
                    float iris_depth = 1.0 - pow(iris_size, 3.0);
                    float iris_rad = sqrt(max(0.0, 1.0 - iris_depth * iris_depth));
                    
                    vec3 norm_P = normalize(vPosition);
                    float slice = norm_P.z - iris_depth;
                    
                    // Main light direction (realistic frontal + top light)
                    vec3 L = normalize(vec3(0.8, 0.6, 1.5));
                    
                    // Fresnel effect for cornea (realistic refractive index)
                    float fresnel = pow(1.0 - dot(N, V), 4.5);
                    fresnel = mix(0.04, 0.95, fresnel);
                    
                    // Specular highlights - strong on cornea, subtle on iris
                        vec3 tex = texture2D(irisMap, vUv).rgb;
                    float irisSpec = 0.0;
                        if (tex == vec3(0.0)) {
                        irisSpec = pow(max(0.0, dot(N, L)), 120.0) * 0.25;
                        spec = irisSpec;
                            irisCol = mix(vec3(0.1, 0.15, 0.2), vec3(0.4, 0.6, 0.8), noiseCol);
                            irisCol *= (1.0 + noiseCol * 0.3);
                    // Diffuse lighting with stronger fill light
                    float diffuse = max(0.0, dot(N, L)) * 0.75 + 0.35;
                        }
                    
                    // Add cornea specular with warm glow
                    finalCol += vec3(1.0, 0.98, 0.95) * spec * 1.2;
                    
                    // Pupil
                    vec3 pupilCol = vec3(0.0);
                    finalCol += vec3(1.0, 0.98, 0.96) * ringVal * 0.35;
                        pupilCol = vec3(0.01, 0.01, 0.02);
                    }
                    
                    finalCol = mix(finalCol, finalCol * (0.88 + g * 0.24), 0.1);
                    vec3 scleraCol = vec3(0.95);
                    if (r > iris_size + 0.1) {
                        vec3 bloodVessels = vec3(noise(norm_P * 15.0));
                        scleraCol = mix(vec3(0.92), vec3(0.88, 0.90, 0.92), bloodVessels * 0.1);
                    }
                    
                        alpha = 1.0 - pow(1.0 - abs(slice), 1.8) * alpha_intensity * 0.8;
                    vec3 finalCol = scleraCol;
                    
                    // Final tone mapping and gamma correction
                    finalCol = pow(finalCol, vec3(0.95)); // slight gamma correction
                    finalCol = mix(finalCol, vec3(length(finalCol)) * 0.7, 0.05); // slight desaturation
                    if (r < iris_size) {
                        finalCol = mix(irisCol, pupilCol, step(pupil_size, r) * (1.0 - step(pupil_size, r - 0.01)));
                    }
                    
                    // Fresnel effect for cornea reflection
                    float fresnel = pow(1.0 - dot(N, V), 5.0);
                    fresnel = mix(0.02, 1.0, fresnel);
                    
                    // Specular highlights on cornea and iris
                    vec3 L = normalize(vec3(1.0, 1.0, 2.0));
                    float spec = pow(max(0.0, dot(N, L)), 80.0);
                    if (r < iris_size) {
                        spec = pow(max(0.0, dot(N, L)), 150.0) * 0.3;
                    }
                    
                    // Apply lighting
                    float diffuse = max(0.0, dot(N, L)) * 0.8 + 0.3;
                    finalCol *= diffuse;
                    finalCol += vec3(1.0) * spec * 0.8;

                    // Add ring overlay (soft additive)
                    float ringVal = texture2D(ringMap, vUv).r;
                    finalCol += vec3(1.0) * ringVal * 0.3;

                    // Add grain overlay (multiply subtle)
                    float g = texture2D(grainMap, vUv * 4.0).r;
                    finalCol = mix(finalCol, finalCol * (0.9 + g * 0.2), 0.12);
                    
                    // Transparency effect at edges
                    float alpha = 1.0;
                    if (slice > 0.0) {
                        alpha = smoothstep(0.5, 0.0, 1.0 - r);
                    } else {
                        alpha = 1.0 - pow(1.0 - abs(slice), 2.0) * alpha_intensity;
                    }
                    
                    gl_FragColor = vec4(finalCol, alpha);
                }
            `,
            side: THREE.FrontSide,
            transparent: true,
            uniforms: {
                iris_size: { value: 0.25 },
                cornea_bump_amount: { value: 0.2 },
                cornea_bump_radius_mult: { value: 1.2 },
                pupil_size: { value: 0.1 },
                iris_border: { value: 0.3 },
                ior: { value: 1.4 },
                alpha_intensity: { value: 0.5 },
                time: { value: 0 }
            }
        });

        // Tune uniforms based on realistic eye proportions
        eyeMaterial.uniforms.iris_size.value = 0.32;      // larger iris for striking appearance
        eyeMaterial.uniforms.pupil_size.value = 0.08;     // smaller pupil (well-lit)
        eyeMaterial.uniforms.cornea_bump_amount.value = 0.25;
        eyeMaterial.uniforms.cornea_bump_radius_mult.value = 1.1;
        eyeMaterial.uniforms.alpha_intensity.value = 0.4;  // less transparent edge

        
        // Ensure uniform textures exist (fallback 1x1 white textures)
        function createSolidCanvas(color=[255,255,255,255]){
            const c = document.createElement('canvas'); c.width = c.height = 1; const ctx = c.getContext('2d'); ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3]/255})`; ctx.fillRect(0,0,1,1); return c;
        }
        const fallback = new THREE.CanvasTexture(createSolidCanvas([255,255,255,255]));
        if (!irisTex) irisTex = fallback; // assign fallback if absent
        if (!normalTex) normalTex = fallback;
        if (!ringTex) ringTex = fallback;
        if (!grainTex) grainTex = fallback;

        eyeMaterial.uniforms.irisMap = { value: irisTex };
        eyeMaterial.uniforms.irisNormalMap = { value: normalTex };
        eyeMaterial.uniforms.ringMap = { value: ringTex };
        eyeMaterial.uniforms.grainMap = { value: grainTex };

        const eyeMesh = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeMesh.castShadow = true;
        eyeMesh.receiveShadow = true;
        scene.add(eyeMesh);

        // Post-processing setup with EffectComposer
        let composer = null;
        let bloomPass = null;
        let fxaaPass = null;
        let vignettePass = null;
        
        try {
            if (EffectComposer && RenderPass) {
                composer = new EffectComposer(renderer);
                composer.addPass(new RenderPass(scene, camera));

                // Bloom pass for eye glow
                if (UnrealBloomPass) {
                    bloomPass = new UnrealBloomPass(
                        new THREE.Vector2(width, height),
                        1.3,  // strength
                        0.7,  // radius
                        0.15  // threshold
                    );
                    composer.addPass(bloomPass);
                }

                // FXAA anti-aliasing
                if (ShaderPass && FXAAShader) {
                    fxaaPass = new ShaderPass(FXAAShader);
                    fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
                    fxaaPass.material.uniforms['resolution'].value.y = 1 / height;
                    composer.addPass(fxaaPass);
                }

                // Vignette shader pass
                const vignetteShader = {
                    uniforms: {
                        tDiffuse: { value: null },
                        vignetteAmount: { value: 0.4 },
                        vignetteBlur: { value: 0.6 }
                    },
                    vertexShader: `
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform sampler2D tDiffuse;
                        uniform float vignetteAmount;
                        uniform float vignetteBlur;
                        varying vec2 vUv;

                        void main() {
                            vec4 col = texture2D(tDiffuse, vUv);
                            vec2 uv = vUv - 0.5;
                            float vign = smoothstep(vignetteBlur, 0.0, length(uv) * vignetteAmount);
                            col.rgb *= mix(0.7, 1.0, vign);
                            gl_FragColor = col;
                        }
                    `
                };
                if (ShaderPass) {
                    vignettePass = new ShaderPass(vignetteShader);
                    composer.addPass(vignettePass);
                }
            }
        } catch (e) {
            console.warn('EffectComposer not available, rendering without post-processing', e);
        }
        
        // Add lights
        const lightMain = new THREE.DirectionalLight(0xffffff, 1.2);
        lightMain.position.set(3, 2, 3);
        lightMain.castShadow = true;
        scene.add(lightMain);
        
        const lightFill = new THREE.DirectionalLight(0xaabbff, 0.4);
        lightFill.position.set(-2, -1, 2);
        scene.add(lightFill);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        
        // Mouse tracking
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / width) * 2 - 1;
            mouseY = -(e.clientY / height) * 2 + 1;
        });
        
        let frameCount = 0;
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            frameCount++;
            eyeMaterial.uniforms.time.value = frameCount * 0.01;
            
            // Subtle continuous rotation
            eyeMesh.rotation.x += 0.0002;
            eyeMesh.rotation.y += 0.0001;
            
            // Gaze tracking with mouse
            eyeMesh.rotation.y += (mouseX * 0.3 - eyeMesh.rotation.y) * 0.05;
            eyeMesh.rotation.x += (mouseY * 0.2 - eyeMesh.rotation.x) * 0.05;
            
            // Render with composer if available, otherwise direct render
            if (composer) {
                composer.render();
            } else {
                renderer.render(scene, camera);
            }
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
            if (composer) composer.setSize(newWidth, newHeight);
            if (fxaaPass) {
                fxaaPass.material.uniforms['resolution'].value.x = 1 / newWidth;
                fxaaPass.material.uniforms['resolution'].value.y = 1 / newHeight;
            }
        });
        
        animate();
    }
    
    // Wait for Three.js to load
    if (window.THREE) {
        setTimeout(initEye, 100);
    } else {
        window.addEventListener('load', () => setTimeout(initEye, 200));
    }
})();
