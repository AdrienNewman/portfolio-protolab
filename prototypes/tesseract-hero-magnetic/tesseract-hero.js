// ============================================
// TESSERACT HERO - Main Entry Point
// Magnetic Tetris 3D assembly animation with violet flash
// 4-phase timeline: ASSEMBLY → FLASH → STABILIZE → LEVITATION
// ============================================

class TesseractHero {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        this.tesseractGroup = new THREE.Group();
        this.assemblyPieces = [];
        this.finalTesseract = null;
        this.coreGroup = new THREE.Group();
        this.coreLight = null; // Violet point light

        this.phase = 'ASSEMBLY'; // ASSEMBLY | FLASH | STABILIZE | LEVITATION
        this.phaseStartTime = 0;

        // Modules (will be initialized after DOM loads modules)
        this.geometry = null;
        this.physics = null;
        this.flash = null;
        this.levitation = null;
        this.trails = null;

        // Animation control
        this.animationId = null;
        this.isRunning = false;
    }

    /**
     * Initialize the Tesseract Hero
     */
    init() {
        const container = document.getElementById('tesseract-container');
        if (!container) {
            console.warn('TesseractHero: Container not found');
            return;
        }

        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.error('TesseractHero: THREE.js not loaded');
            return;
        }

        // Initialize modules
        this.geometry = new TesseractGeometry();
        this.physics = new AssemblyPhysics();
        this.levitation = new LevitationController();

        this.setupScene(container);
        this.createTesseract();

        // Initialize trails and flash after scene exists
        this.trails = new ParticleTrails(this.scene);
        this.flash = new FlashEffect(this.scene);

        // Handle resize
        window.addEventListener('resize', () => this.handleResize(container));

        // Handle visibility (pause when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Start animation
        this.isRunning = true;
        this.animate();

        console.log('TesseractHero: Initialized successfully');
    }

    /**
     * Setup Three.js scene
     */
    setupScene(container) {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0); // Transparent background
        container.appendChild(this.renderer.domElement);

        // Ambient light (subtle)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        // Violet point light at core (for WAHOU effect)
        this.coreLight = new THREE.PointLight(0xff0080, 1.5, 10);
        this.coreLight.position.set(0, 0, 0);
        this.scene.add(this.coreLight);
    }

    /**
     * Create Tesseract components
     */
    createTesseract() {
        // Create assembly packets (mini floating packets, dispersed)
        this.assemblyPieces = this.geometry.createAssemblyPackets(12);
        this.assemblyPieces.forEach(p => this.tesseractGroup.add(p));

        // Create final tesseract (floating packet structure, invisible at start)
        this.finalTesseract = this.geometry.createFinalTesseract();
        this.finalTesseract.visible = false;
        this.tesseractGroup.add(this.finalTesseract);

        // Create violet core (always visible, pulsing)
        this.coreGroup = this.geometry.createCore();
        this.tesseractGroup.add(this.coreGroup);

        this.scene.add(this.tesseractGroup);
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        const elapsed = this.clock.getElapsedTime();
        const delta = this.clock.getDelta();

        // State machine
        switch (this.phase) {
            case 'ASSEMBLY':
                this.updateAssembly(elapsed, delta);
                if (elapsed >= 3.0) this.transitionToFlash();
                break;

            case 'FLASH':
                this.updateFlash(elapsed, delta);
                if (elapsed >= 3.5) this.transitionToStabilize();
                break;

            case 'STABILIZE':
                this.updateStabilize(elapsed);
                if (elapsed >= 4.0) this.transitionToLevitation();
                break;

            case 'LEVITATION':
                this.updateLevitation(delta);
                break;
        }

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * PHASE 1: ASSEMBLY (0-3s)
     * Mini packets converge magnetically toward core
     */
    updateAssembly(elapsed, delta) {
        // Apply magnetic physics to assembly packets
        this.physics.update(this.assemblyPieces, delta);

        // Weak core pulse during assembly
        const coreSphere = this.coreGroup.getObjectByName('coreSphere');
        if (coreSphere) {
            const pulse = 1 + Math.sin(elapsed * 3) * 0.05;
            coreSphere.scale.set(pulse, pulse, pulse);
        }

        // Violet light weak pulse
        if (this.coreLight) {
            this.coreLight.intensity = 1.0 + Math.sin(elapsed * 3) * 0.3;
        }

        // Update particle trails
        this.trails.update(this.assemblyPieces, delta);
    }

    /**
     * Transition: ASSEMBLY → FLASH (3.0s)
     */
    transitionToFlash() {
        this.phase = 'FLASH';
        this.phaseStartTime = this.clock.getElapsedTime();

        console.log('TesseractHero: Transitioning to FLASH');

        // Trigger flash effect
        this.flash.trigger();

        // Hide assembled packets
        this.assemblyPieces.forEach(p => p.visible = false);

        // Show final tesseract
        this.finalTesseract.visible = true;

        // Cleanup trails
        this.trails.cleanup();
    }

    /**
     * PHASE 2: FLASH (3.0-3.5s)
     * Radial violet explosion
     */
    updateFlash(elapsed, delta) {
        const phaseProgress = elapsed - this.phaseStartTime;
        this.flash.update(delta, phaseProgress);

        // Continue core pulse
        this.levitation.updateCoreHeartbeat(this.coreGroup);

        // Violet light explosion during flash
        if (this.coreLight) {
            if (phaseProgress < 0.2) {
                // Expansion: 1.5 → 3.0
                this.coreLight.intensity = THREE.MathUtils.lerp(1.5, 3.0, phaseProgress / 0.2);
            } else if (phaseProgress < 0.5) {
                // Resorption: 3.0 → 1.5
                const t = (phaseProgress - 0.2) / 0.3;
                this.coreLight.intensity = THREE.MathUtils.lerp(3.0, 1.5, t);
            }
        }
    }

    /**
     * Transition: FLASH → STABILIZE (3.5s)
     */
    transitionToStabilize() {
        this.phase = 'STABILIZE';
        this.phaseStartTime = this.clock.getElapsedTime();

        console.log('TesseractHero: Transitioning to STABILIZE');

        // Fade-in name with blur effect
        const nameEl = document.querySelector('.tesseract-name');
        if (nameEl) {
            nameEl.style.transition = 'opacity 0.5s ease, filter 0.5s ease';
            nameEl.style.opacity = '1';
            nameEl.style.filter = 'blur(0)';
        }
    }

    /**
     * PHASE 3: STABILIZE (3.5-4.0s)
     * Name appears, rotation calms down
     */
    updateStabilize(elapsed) {
        // Gradual slowdown of rotation
        const phaseProgress = elapsed - this.phaseStartTime;
        const rotationSpeed = THREE.MathUtils.lerp(0.3, 0.1, Math.min(phaseProgress / 0.5, 1));
        this.tesseractGroup.rotation.y += rotationSpeed * 0.016; // ~60fps

        // Core heartbeat continues
        this.levitation.updateCoreHeartbeat(this.coreGroup);
    }

    /**
     * Transition: STABILIZE → LEVITATION (4.0s)
     */
    transitionToLevitation() {
        this.phase = 'LEVITATION';

        console.log('TesseractHero: Transitioning to LEVITATION (infinite loop)');
    }

    /**
     * PHASE 4: LEVITATION (4.0s → ∞)
     * Continuous floating motion with multi-axis independent rotations
     */
    updateLevitation(delta) {
        // Pass finalTesseract (not tesseractGroup) for independent cube rotations
        this.levitation.update(this.finalTesseract, this.coreGroup, delta);

        // Violet light heartbeat pulse (synchronized with core)
        if (this.coreLight) {
            const time = this.clock.getElapsedTime();
            const pulse = 1.5 + Math.sin(time * 2.5) * 0.5;
            this.coreLight.intensity = pulse;
        }
    }

    /**
     * Handle window resize
     */
    handleResize(container) {
        const aspect = container.clientWidth / container.clientHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    /**
     * Pause animation
     */
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.clock.stop();
    }

    /**
     * Resume animation
     */
    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.clock.start();
            this.animate();
        }
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.pause();

        // Dispose geometries and materials
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => mat.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        // Remove renderer
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.remove();
        }

        console.log('TesseractHero: Disposed');
    }
}

// ============================================
// AUTO-INITIALIZATION
// ============================================

function initTesseractHero() {
    console.log('🚀 TesseractHero: Tentative d\'initialisation...');

    // Check if container exists
    const container = document.getElementById('tesseract-container');
    if (!container) {
        console.error('❌ TesseractHero: Container #tesseract-container not found');
        return;
    }
    console.log('✅ Container trouvé');

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('❌ TesseractHero: THREE.js is required');
        return;
    }
    console.log('✅ THREE.js chargé');

    // Check if modules are loaded with detailed diagnostics
    const modules = {
        TesseractGeometry: typeof TesseractGeometry !== 'undefined' ? TesseractGeometry : undefined,
        AssemblyPhysics: typeof AssemblyPhysics !== 'undefined' ? AssemblyPhysics : undefined,
        ParticleTrails: typeof ParticleTrails !== 'undefined' ? ParticleTrails : undefined,
        FlashEffect: typeof FlashEffect !== 'undefined' ? FlashEffect : undefined,
        LevitationController: typeof LevitationController !== 'undefined' ? LevitationController : undefined
    };

    const missingModules = [];
    for (const [name, module] of Object.entries(modules)) {
        if (typeof module === 'undefined') {
            missingModules.push(name);
        }
    }

    if (missingModules.length > 0) {
        console.error('❌ TesseractHero: Modules manquants:', missingModules);
        console.log('⏳ Réessai dans 200ms...');
        setTimeout(initTesseractHero, 200);  // Retry
        return;
    }
    console.log('✅ Tous les modules chargés');

    // Create and initialize
    const hero = new TesseractHero();
    hero.init();

    // Expose for debugging
    window.tesseractHero = hero;

    console.log('🎉 TesseractHero: Initialisé avec succès!');
}

// Wait for DOM and modules to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTesseractHero);
} else {
    // DOM already loaded, but wait for module scripts to compile
    setTimeout(initTesseractHero, 500);  // Increased from 100ms to 500ms
}
