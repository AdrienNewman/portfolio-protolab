// ============================================
// TESSERACT GEOMETRY
// Design inspiré floating-packet.js
// Mini-packets cyan assemblés → Tesseract final cyan + cœur violet
// ============================================

class TesseractGeometry {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Create mini-packets (comme floating-packet.js)
     * Pour la phase ASSEMBLY - convergence magnétique
     * @param {number} count - Number of packets to create
     * @returns {Array} - Array of packet groups with physics properties
     */
    createAssemblyPackets(count) {
        const packets = [];

        for (let i = 0; i < count; i++) {
            const packet = new THREE.Group();

            // Core cube (cyan semi-transparent - comme floating packet)
            const core = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 0.05, 0.05),
                new THREE.MeshBasicMaterial({
                    color: 0x00ffff,  // Cyan
                    transparent: true,
                    opacity: 0.28  // Même opacity que floating packet
                })
            );
            packet.add(core);

            // Wireframe overlay (cyan)
            const wire = new THREE.Mesh(
                new THREE.BoxGeometry(0.055, 0.055, 0.055),
                new THREE.MeshBasicMaterial({
                    color: 0x00ffff,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.21  // Même opacity que floating packet
                })
            );
            packet.add(wire);

            // 1 data bit central (blanc)
            const bit = new THREE.Mesh(
                new THREE.BoxGeometry(0.01, 0.01, 0.01),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,  // Blanc
                    transparent: true,
                    opacity: 0.35
                })
            );
            packet.add(bit);

            // Distribution sphérique (radius 2.0-2.5)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 2.0 + Math.random() * 0.5;

            packet.position.set(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );

            // Random initial rotation
            packet.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            // Physics properties
            packet.userData.velocity = new THREE.Vector3(0, 0, 0);
            packet.userData.snapped = false;

            packets.push(packet);
        }

        return packets;
    }

    /**
     * Create final tesseract (floating packet style)
     * Structure: outer cube + wireframe + inner cube + data bits
     * @returns {THREE.Group} - Final tesseract group
     */
    createFinalTesseract() {
        const group = new THREE.Group();

        // OUTER CUBE CORE (cyan semi-transparent)
        const outerCore = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.55, 0.55),
            new THREE.MeshBasicMaterial({
                color: 0x00ffff,  // Cyan
                transparent: true,
                opacity: 0.28  // Comme floating packet
            })
        );
        outerCore.name = 'outerCore';
        group.add(outerCore);

        // WIREFRAME OVERLAY (légèrement plus grand)
        const wireframe = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, 0.6),
            new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                wireframe: true,
                transparent: true,
                opacity: 0.21  // Comme floating packet
            })
        );
        wireframe.name = 'wireframe';
        group.add(wireframe);

        // INNER CUBE (plus petit, cyan)
        const innerCube = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.22, 0.22),
            new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3
            })
        );
        innerCube.name = 'innerCube';
        group.add(innerCube);

        // DATA BITS (4 petits cubes blancs)
        const bitGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
        const dataBits = [];

        for (let i = 0; i < 4; i++) {
            const bit = new THREE.Mesh(
                bitGeometry,
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,  // Blanc
                    transparent: true,
                    opacity: 0.35
                })
            );

            // Positions réparties
            bit.position.set(
                (i % 2 - 0.5) * 0.15,
                (Math.floor(i / 2) - 0.5) * 0.1,
                0.05
            );

            bit.userData.isBit = true;
            bit.userData.phase = i * 0.5;
            bit.name = 'dataBit' + i;

            group.add(bit);
            dataBits.push(bit);
        }

        group.userData.dataBits = dataBits;

        return group;
    }

    /**
     * Create the VIOLET pulsing core with glow sprite
     * (Inspired by floating-packet.js createGlowTexture)
     * @returns {THREE.Group} - Core group with sphere and glow
     */
    createCore() {
        const coreGroup = new THREE.Group();

        const segments = this.isMobile ? 12 : 16;

        // Sphère VIOLETTE (MAGENTA #ff0080)
        const coreSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, segments, segments),
            new THREE.MeshBasicMaterial({
                color: 0xff0080,  // VIOLET !
                transparent: true,
                opacity: 0.9
            })
        );
        coreSphere.name = 'coreSphere';
        coreGroup.add(coreSphere);

        // Glow sprite VIOLET (additive blending)
        const glowTexture = this.createGlowTexture();
        const glowSprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: glowTexture,
                color: 0xff0080,  // VIOLET !
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            })
        );
        glowSprite.scale.set(0.3, 0.3, 1);
        glowSprite.name = 'glowSprite';
        coreGroup.add(glowSprite);

        return coreGroup;
    }

    /**
     * Create radial gradient texture for glow effect
     * Copied from floating-packet.js lines 115-135
     * @returns {THREE.CanvasTexture}
     */
    createGlowTexture() {
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
        gradient.addColorStop(0.3, 'rgba(255, 0, 128, 0.5)'); // Violet
        gradient.addColorStop(1, 'rgba(255, 0, 128, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
}

// Export for use in tesseract-hero.js
if (typeof window !== 'undefined') {
    window.TesseractGeometry = TesseractGeometry;
}
