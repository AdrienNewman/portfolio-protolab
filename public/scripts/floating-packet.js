// ============================================
// FLOATING PACKET - Easter Egg
// Clickable network packet floating in Three.js background
// Clicking launches NetDefender game
// ============================================

(function() {
    'use strict';

    // Wait for Three.js to be ready
    function init() {
        if (typeof THREE === 'undefined') {
            console.warn('FloatingPacket: THREE.js not loaded');
            return;
        }

        const canvas = document.getElementById('three-canvas');
        if (!canvas) {
            console.warn('FloatingPacket: Canvas not found');
            return;
        }

        // Get the existing Three.js scene elements
        // We need to hook into the existing setup
        let scene, camera, renderer;
        let packetMesh = null;
        let packetGroup = null;
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        let isHovered = false;
        let pulsePhase = 0;
        let floatPhase = Math.random() * Math.PI * 2;

        // Packet movement
        let packetPosition = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2
        };
        let packetVelocity = {
            x: (Math.random() - 0.5) * 0.002,
            y: (Math.random() - 0.5) * 0.001,
            z: 0
        };

        // Create packet geometry (cube with wireframe overlay)
        function createPacket() {
            packetGroup = new THREE.Group();

            // Main cube (solid core)
            const coreGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.08);
            const coreMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8
            });
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            packetGroup.add(core);

            // Wireframe overlay
            const wireGeometry = new THREE.BoxGeometry(0.16, 0.11, 0.09);
            const wireMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            });
            const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
            packetGroup.add(wireframe);

            // Data bits (small cubes inside)
            const bitGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
            const bitMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9
            });

            for (let i = 0; i < 4; i++) {
                const bit = new THREE.Mesh(bitGeometry, bitMaterial.clone());
                bit.position.set(
                    (i % 2 - 0.5) * 0.06,
                    (Math.floor(i / 2) - 0.5) * 0.04,
                    0.02
                );
                bit.userData.isBit = true;
                bit.userData.phase = i * 0.5;
                packetGroup.add(bit);
            }

            // Glow sprite
            const glowTexture = createGlowTexture();
            const glowMaterial = new THREE.SpriteMaterial({
                map: glowTexture,
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            const glow = new THREE.Sprite(glowMaterial);
            glow.scale.set(0.4, 0.4, 1);
            glow.userData.isGlow = true;
            packetGroup.add(glow);

            // Position
            packetGroup.position.set(packetPosition.x, packetPosition.y, packetPosition.z);

            // Store reference to main mesh for raycasting
            packetMesh = core;

            return packetGroup;
        }

        // Create a simple radial gradient texture for glow
        function createGlowTexture() {
            const size = 64;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(
                size / 2, size / 2, 0,
                size / 2, size / 2, size / 2
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(0, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);

            const texture = new THREE.CanvasTexture(canvas);
            return texture;
        }

        // Hook into the existing Three.js animation
        function hookIntoScene() {
            // Find the existing renderer by looking at the canvas
            const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
            if (!gl) return false;

            // We need to create our own mini-scene that overlays
            // Or better: modify the existing three-background.js

            return true;
        }

        // Enhanced three-background integration
        // This script adds the packet to the existing scene
        function integrateWithBackground() {
            // Wait for the Three.js scene to be initialized
            const checkScene = setInterval(() => {
                // Look for scene in window (if exposed) or find via canvas
                if (window.threeScene) {
                    scene = window.threeScene;
                    camera = window.threeCamera;
                    renderer = window.threeRenderer;

                    clearInterval(checkScene);
                    addPacketToScene();
                }
            }, 100);

            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkScene);
                if (!scene) {
                    console.log('FloatingPacket: Creating standalone scene');
                    createStandaloneOverlay();
                }
            }, 5000);
        }

        function addPacketToScene() {
            if (!scene) return;

            const packet = createPacket();
            scene.add(packet);

            // Start animation loop addition
            animatePacket();
        }

        // Alternative: Create an overlay canvas for the packet
        function createStandaloneOverlay() {
            // Create overlay canvas
            const overlayCanvas = document.createElement('canvas');
            overlayCanvas.id = 'packet-overlay';
            overlayCanvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            `;
            document.body.appendChild(overlayCanvas);

            // Create Three.js scene for packet only
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 3;

            renderer = new THREE.WebGLRenderer({
                canvas: overlayCanvas,
                alpha: true,
                antialias: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setClearColor(0x000000, 0);

            // Add packet
            const packet = createPacket();
            scene.add(packet);

            // Handle resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            // Enable pointer events for click detection
            overlayCanvas.style.pointerEvents = 'auto';
            overlayCanvas.style.cursor = 'default';

            // Start animation
            animatePacket();
        }

        function animatePacket() {
            if (!packetGroup) return;

            function animate() {
                requestAnimationFrame(animate);

                // Update phases
                pulsePhase += 0.03;
                floatPhase += 0.01;

                // Float movement
                packetPosition.x += packetVelocity.x;
                packetPosition.y += packetVelocity.y;
                packetPosition.y += Math.sin(floatPhase) * 0.001;

                // Bounce off boundaries
                if (Math.abs(packetPosition.x) > 2.5) {
                    packetVelocity.x *= -1;
                    packetPosition.x = Math.sign(packetPosition.x) * 2.5;
                }
                if (Math.abs(packetPosition.y) > 1.5) {
                    packetVelocity.y *= -1;
                    packetPosition.y = Math.sign(packetPosition.y) * 1.5;
                }

                // Apply position
                packetGroup.position.set(packetPosition.x, packetPosition.y, packetPosition.z);

                // Rotation
                packetGroup.rotation.y += 0.01;
                packetGroup.rotation.x = Math.sin(floatPhase * 0.5) * 0.1;

                // Pulse effect
                const pulse = 1 + Math.sin(pulsePhase) * 0.1;

                // Update children
                packetGroup.children.forEach(child => {
                    if (child.userData.isGlow) {
                        child.material.opacity = isHovered ? 0.6 : 0.3 + Math.sin(pulsePhase * 2) * 0.1;
                        child.scale.set(0.4 * pulse, 0.4 * pulse, 1);
                        if (isHovered) {
                            child.material.color.setHex(0xff0080); // Magenta on hover
                        } else {
                            child.material.color.setHex(0x00ffff);
                        }
                    } else if (child.userData.isBit) {
                        const bitPulse = Math.sin(pulsePhase * 3 + child.userData.phase) * 0.5 + 0.5;
                        child.material.opacity = 0.5 + bitPulse * 0.5;
                    } else if (child.material && !child.material.wireframe) {
                        // Core
                        if (isHovered) {
                            child.material.color.setHex(0xff0080);
                            child.material.opacity = 1;
                        } else {
                            child.material.color.setHex(0x00ffff);
                            child.material.opacity = 0.8;
                        }
                    }
                });

                // Scale on hover
                const targetScale = isHovered ? 1.3 : 1;
                packetGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

                // Render if using standalone scene
                if (renderer && scene && camera) {
                    renderer.render(scene, camera);
                }
            }

            animate();
        }

        // Mouse interaction
        function setupInteraction() {
            const targetCanvas = document.getElementById('packet-overlay') || canvas;

            targetCanvas.addEventListener('mousemove', (event) => {
                if (!packetMesh || !camera) return;

                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);

                // Check intersection with packet group
                const intersects = raycaster.intersectObjects(packetGroup.children, true);

                const wasHovered = isHovered;
                isHovered = intersects.length > 0;

                if (isHovered !== wasHovered) {
                    targetCanvas.style.cursor = isHovered ? 'pointer' : 'default';

                    // Update custom cursor if exists
                    const customCursor = document.getElementById('cursor');
                    if (customCursor) {
                        if (isHovered) {
                            customCursor.classList.add('hover');
                        } else {
                            customCursor.classList.remove('hover');
                        }
                    }
                }
            });

            targetCanvas.addEventListener('click', (event) => {
                if (!isHovered) return;

                // Launch the game!
                console.log('FloatingPacket: Launching NetDefender!');

                if (typeof window.openNetDefender === 'function') {
                    window.openNetDefender();
                } else {
                    console.warn('FloatingPacket: openNetDefender not available');
                }
            });

            // Listen for game close to respawn packet
            window.addEventListener('netdefender-closed', () => {
                // Respawn packet at random position
                packetPosition.x = (Math.random() - 0.5) * 4;
                packetPosition.y = (Math.random() - 0.5) * 2;
                console.log('FloatingPacket: Game closed, packet respawned');
            });
        }

        // Initialize
        setTimeout(() => {
            createStandaloneOverlay();
            setupInteraction();
            console.log('FloatingPacket: Easter egg initialized - Click the floating packet to play NetDefender!');
        }, 1000); // Wait for page to settle
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
