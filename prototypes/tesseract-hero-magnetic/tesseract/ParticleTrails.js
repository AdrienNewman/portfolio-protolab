// ============================================
// PARTICLE TRAILS
// Cyan trails behind moving Tetris pieces
// Pool-based system to avoid allocations
// ============================================

class ParticleTrails {
    constructor(scene) {
        this.scene = scene;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.maxParticles = this.isMobile ? 80 : 150;
        this.particlePool = [];
        this.particleLifetime = 0.3; // 300ms
        this.spawnInterval = 0.05; // Spawn every 50ms
        this.lastSpawnTime = 0;
    }

    /**
     * Create a single trail particle
     * @param {THREE.Vector3} position - Spawn position
     * @returns {THREE.Mesh} - Particle mesh
     */
    createParticle(position) {
        const geometry = new THREE.SphereGeometry(0.01, 4, 4);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);

        // Particle metadata
        particle.userData.birthTime = performance.now();
        particle.userData.initialOpacity = 0.6;

        return particle;
    }

    /**
     * Update trails for all moving pieces
     * @param {Array} pieces - Array of piece groups
     * @param {number} deltaTime - Time since last frame
     */
    update(pieces, deltaTime) {
        const now = performance.now();

        // Spawn new particles behind moving pieces
        if (now - this.lastSpawnTime > this.spawnInterval * 1000) {
            pieces.forEach((piece) => {
                if (!piece.userData.snapped && piece.userData.velocity.length() > 0.01) {
                    // Only spawn if piece is moving
                    if (this.particlePool.length < this.maxParticles) {
                        const particle = this.createParticle(piece.position);
                        this.scene.add(particle);
                        this.particlePool.push(particle);
                    }
                }
            });

            this.lastSpawnTime = now;
        }

        // Update existing particles
        for (let i = this.particlePool.length - 1; i >= 0; i--) {
            const particle = this.particlePool[i];
            const age = (now - particle.userData.birthTime) / 1000;

            if (age > this.particleLifetime) {
                // Remove dead particle
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                this.particlePool.splice(i, 1);
            } else {
                // Fade out
                const fadeProgress = age / this.particleLifetime;
                particle.material.opacity = particle.userData.initialOpacity * (1 - fadeProgress);
            }
        }
    }

    /**
     * Clean up all particles (call when transitioning to next phase)
     */
    cleanup() {
        this.particlePool.forEach((particle) => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        this.particlePool = [];
    }
}

// Export for use in tesseract-hero.js
if (typeof window !== 'undefined') {
    window.ParticleTrails = ParticleTrails;
}
