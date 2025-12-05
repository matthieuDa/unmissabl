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
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1.0;
        outerEyeContainer.appendChild(renderer.domElement);
        
        // Create eye geometry with high resolution
        const eyeGeometry = new THREE.SphereGeometry(1, 256, 256);
        
        // Create custom shader for realistic eye
        const eyeMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vViewDir;
                
                uniform float iris_size;
                uniform float cornea_bump_amount;
                uniform float cornea_bump_radius_mult;
                
                void main() {
                    vec3 pos = position;
                    float iris_depth = 1.0 - pow(iris_size, 3.0);
                    vec3 norm = normalize(pos);
                    
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
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vViewDir;
                
                uniform float pupil_size;
                uniform float iris_size;
                uniform float iris_border;
                uniform float ior;
                uniform float alpha_intensity;
                
                float hash(float n) {
                    return fract(sin(n) * 43758.5453);
                }
                
                float noise(vec3 x) {
                    vec3 p = floor(x);
                    vec3 f = fract(x);
                    f = f * f * (3.0 - 2.0 * f);
                    float n = p.x + p.y * 157.0 + 113.0 * p.z;
                    return mix(
                        mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                            mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
                        mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                            mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
                }
                
                void main() {
                    vec3 N = normalize(vNormal);
                    vec3 V = normalize(vViewDir);
                    
                    // Calculate iris/pupil position
                    float iris_depth = 1.0 - pow(iris_size, 3.0);
                    float iris_rad = sqrt(max(0.0, 1.0 - iris_depth * iris_depth));
                    
                    vec3 norm_P = normalize(vPosition);
                    float slice = norm_P.z - iris_depth;
                    
                    float r = length(norm_P.xy);
                    float iris_pos = (r - pupil_size) / (iris_size - pupil_size);
                    
                    // Iris color with noise texture
                    vec3 irisCol = vec3(0.3, 0.5, 0.7);
                    if (r < iris_size) {
                        vec3 noiseCol = vec3(noise(norm_P * 8.0));
                        irisCol = mix(vec3(0.1, 0.15, 0.2), vec3(0.4, 0.6, 0.8), noiseCol);
                        irisCol *= (1.0 + noiseCol * 0.3);
                    }
                    
                    // Pupil
                    vec3 pupilCol = vec3(0.0);
                    if (r < pupil_size) {
                        pupilCol = vec3(0.01, 0.01, 0.02);
                    }
                    
                    // Sclera (white of the eye) with subtle texture
                    vec3 scleraCol = vec3(0.95);
                    if (r > iris_size + 0.1) {
                        vec3 bloodVessels = vec3(noise(norm_P * 15.0));
                        scleraCol = mix(vec3(0.92), vec3(0.88, 0.90, 0.92), bloodVessels * 0.1);
                    }
                    
                    // Blend iris, pupil and sclera
                    vec3 finalCol = scleraCol;
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
                alpha_intensity: { value: 0.5 }
            }
        });
        
        const eyeMesh = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeMesh.castShadow = true;
        eyeMesh.receiveShadow = true;
        scene.add(eyeMesh);
        
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
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Subtle continuous rotation
            eyeMesh.rotation.x += 0.0002;
            eyeMesh.rotation.y += 0.0001;
            
            // Gaze tracking with mouse
            eyeMesh.rotation.y += (mouseX * 0.3 - eyeMesh.rotation.y) * 0.05;
            eyeMesh.rotation.x += (mouseY * 0.2 - eyeMesh.rotation.x) * 0.05;
            
            renderer.render(scene, camera);
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
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
