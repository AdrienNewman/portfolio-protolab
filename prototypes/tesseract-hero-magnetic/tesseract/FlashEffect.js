// ============================================
// FLASH EFFECT
// Radial violet flash explosion when pieces fuse
// Expansion (0-200ms) + Resorption (200-500ms)
// ============================================

class FlashEffect {
    constructor(scene) {
        this.scene = scene;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.flashSphere = null;
        this.flashParticles = [];
        this.isActive = false;
        this.startTime = 0;
        this.duration = 0.5; // 500ms total
        this.expansionDuration = 0.2; // 200ms
        this.resorptionDuration = 0.3; // 300ms
    }

    /**
     * Easing function for expansion
     */
    easeOutQuad(t) {
        return t * (2 - t);
    }

    /**
     * Trigger the flash effect
     */
    trigger() {
        this.isActive = true;
        this.startTime = performance.now();
        this.createFlashSphere();
        this.createRadialParticles();
    }

    /**
     * Create the expanding/contracting flash sphere
     */
    createFlashSphere() {
        const segments = this.isMobile ? 12 : 16;
        const geometry = new THREE.SphereGeometry(0.1, segments, segments);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0080,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });

        this.flashSphere = new THREE.Mesh(geometry, material);
        this.flashSphere.position.set(0, 0, 0);
        this.scene.add(this.flashSphere);
    }

    /**
     * Create radial explosion particles
     */
    createRadialParticles() {
        const particleCount = this.isMobile ? 50 : 80;
        const particleGeometry = new THREE.SphereGeometry(0.01, 4, 4);

        for (let i = 0; i < particleCount; i++) {
            // Uniform spherical distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            const direction = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.sin(phi) * Math.sin(theta),
                Math.cos(phi)
            );

            const material = new THREE.MeshBasicMaterial({
                color: 0xff0080,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            const particle = new THREE.Mesh(particleGeometry, material);
            particle.position.set(0, 0, 0);
            particle.userData.direction = direction;
            particle.userData.speed = 0.5 + Math.random() * 0.5; // 0.5-1.0
            particle.userData.initialOpacity = 0.8;

            this.scene.add(particle);
            this.flashParticles.push(particle);
        }
    }

    /**
     * Update flash effect animation
     * @param {number} deltaTime - Time since last frame
     * @param {number} phaseProgress - Time since flash trigger
     */
    update(deltaTime, phaseProgress) {
        if (!this.isActive) return;

        const elapsed = phaseProgress;

        if (elapsed < this.expansionDuration) {
            // Expansion phase (0-200ms)
            this.updateExpansion(elapsed);
        } else if (elapsed < this.duration) {
            // Resorption phase (200-500ms)
            this.updateResorption(elapsed - this.expansionDuration);
        } else {
            // Flash complete
            this.cleanup();
        }

        // Update particles
        this.updateParticles(elapsed, deltaTime);
    }

    /**
     * Update expansion phase (sphere grows)
     */
    updateExpansion(elapsed) {
        if (!this.flashSphere) return;

        const progress = elapsed / this.expansionDuration;
        const easedProgress = this.easeOutQuad(progress);

        // Scale: 0.1 → 3.0
        const scale = THREE.MathUtils.lerp(0.1, 3.0, easedProgress);
        this.flashSphere.scale.set(scale, scale, scale);

        // Opacity: 0 → 0.8
        this.flashSphere.material.opacity = THREE.MathUtils.lerp(0, 0.8, progress);
    }

    /**
     * Update resorption phase (sphere contracts)
     */
    updateResorption(elapsed) {
        if (!this.flashSphere) return;

        const progress = elapsed / this.resorptionDuration;

        // Scale: 3.0 → 0.1
        const scale = THREE.MathUtils.lerp(3.0, 0.1, progress);
        this.flashSphere.scale.set(scale, scale, scale);

        // Opacity: 0.8 → 0
        this.flashSphere.material.opacity = THREE.MathUtils.lerp(0.8, 0, progress);
    }

    /**
     * Update radial particles
     */
    updateParticles(elapsed, deltaTime) {
        this.flashParticles.forEach((particle) => {
            if (elapsed < 0.3) {
                // Expansion phase: fly outward
                const displacement = particle.userData.direction.clone()
                    .multiplyScalar(particle.userData.speed * deltaTime * 60);
                particle.position.add(displacement);
            } else {
                // Gravity pull phase: return to center
                const pullDirection = particle.position.clone().negate().normalize();
                const displacement = pullDirection.multiplyScalar(0.05 * deltaTime * 60);
                particle.position.add(displacement);
            }

            // Fade out
            const fadeProgress = Math.min(elapsed / this.duration, 1);
            particle.material.opacity = particle.userData.initialOpacity * (1 - fadeProgress);

            // Scale down
            const scale = 1 - fadeProgress * 0.5;
            particle.scale.set(scale, scale, scale);
        });
    }

    /**
     * Clean up flash objects
     */
    cleanup() {
        if (this.flashSphere) {
            this.scene.remove(this.flashSphere);
            this.flashSphere.geometry.dispose();
            this.flashSphere.material.dispose();
            this.flashSphere = null;
        }

        this.flashParticles.forEach((particle) => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        this.flashParticles = [];

        this.isActive = false;
    }
}

// Export for use in tesseract-hero.js
if (typeof window !== 'undefined') {
    window.FlashEffect = FlashEffect;
}
