// ============================================
// LEVITATION CONTROLLER
// Multi-frequency floating motion (organic, non-mechanical)
// Core heartbeat pulse
// ============================================

class LevitationController {
    constructor() {
        this.time = 0;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Update levitation animation
     * @param {THREE.Group} tesseractGroup - Main tesseract group (finalTesseract)
     * @param {THREE.Group} coreGroup - Core group with sphere and glow
     * @param {number} deltaTime - Time since last frame
     */
    update(tesseractGroup, coreGroup, deltaTime) {
        this.time += deltaTime;

        if (this.reducedMotion) {
            // Only slow rotation for reduced motion
            tesseractGroup.rotation.y += 0.05 * deltaTime;
        } else {
            // Full levitation animation
            this.updatePosition(tesseractGroup);
            this.updateIndependentRotations(tesseractGroup, deltaTime);
        }

        // Core heartbeat (always active)
        this.updateCoreHeartbeat(coreGroup);
    }

    /**
     * Update position with multi-frequency wobble
     * Superpose multiple sine/cosine waves for organic movement
     */
    updatePosition(group) {
        // Y-axis floating (vertical)
        const wobbleY =
            Math.sin(this.time * 0.7) * 0.015 +
            Math.cos(this.time * 1.9) * 0.006;

        // X-axis drift (horizontal)
        const wobbleX =
            Math.sin(this.time * 0.9) * 0.02 +
            Math.sin(this.time * 2.3) * 0.008;

        group.position.y = wobbleY;
        group.position.x = wobbleX;
    }

    /**
     * Update independent rotations for outer, wireframe, and inner cubes
     * Each cube rotates on ALL axes (X, Y, Z) at different speeds
     * CRITICAL: This creates the "wahou" effect with independent multi-axis rotations
     */
    updateIndependentRotations(tesseractGroup, deltaTime) {
        // Get individual cubes by name
        const outerCore = tesseractGroup.getObjectByName('outerCore');
        const wireframe = tesseractGroup.getObjectByName('wireframe');
        const innerCube = tesseractGroup.getObjectByName('innerCube');
        const dataBits = [];
        for (let i = 0; i < 4; i++) {
            const bit = tesseractGroup.getObjectByName('dataBit' + i);
            if (bit) dataBits.push(bit);
        }

        // OUTER CORE - Slow rotation on ALL axes
        if (outerCore) {
            outerCore.rotation.x += 0.3 * deltaTime;
            outerCore.rotation.y += 0.5 * deltaTime;
            outerCore.rotation.z += 0.2 * deltaTime;
        }

        // WIREFRAME - Very slow rotation, offset from outer
        if (wireframe) {
            wireframe.rotation.x += 0.15 * deltaTime;
            wireframe.rotation.y += 0.25 * deltaTime;
            wireframe.rotation.z += 0.1 * deltaTime;
        }

        // INNER CUBE - Fast rotation on ALL axes
        if (innerCube) {
            innerCube.rotation.x += 0.7 * deltaTime;
            innerCube.rotation.y += 0.9 * deltaTime;
            innerCube.rotation.z += 0.6 * deltaTime;
        }

        // DATA BITS - Individual opacity pulse
        dataBits.forEach((bit, i) => {
            if (bit.userData && bit.userData.phase !== undefined) {
                const bitPulse = Math.sin(this.time * 3 + bit.userData.phase) * 0.5 + 0.5;
                bit.material.opacity = 0.2 + bitPulse * 0.3;
            }
        });
    }

    /**
     * Update core heartbeat (irregular pulsing)
     * Core sphere and glow sprite scale
     */
    updateCoreHeartbeat(coreGroup) {
        // Multi-frequency heartbeat (3 waves)
        const pulse = 1 +
            Math.sin(this.time * 2.5) * 0.12 +
            Math.sin(this.time * 5.5) * 0.05 +
            Math.sin(this.time * 8.0) * 0.025;

        // Apply to core sphere
        const coreSphere = coreGroup.getObjectByName('coreSphere');
        if (coreSphere) {
            coreSphere.scale.set(pulse, pulse, pulse);
        }

        // Apply to glow sprite (slightly different scale for depth)
        const glowSprite = coreGroup.getObjectByName('glowSprite');
        if (glowSprite) {
            const glowPulse = pulse * 1.1; // 10% larger
            glowSprite.scale.set(0.3 * glowPulse, 0.3 * glowPulse, 1);

            // Glow opacity pulse
            const opacityPulse = 0.6 + Math.sin(this.time * 3) * 0.15;
            glowSprite.material.opacity = opacityPulse;
        }
    }
}

// Export for use in tesseract-hero.js
if (typeof window !== 'undefined') {
    window.LevitationController = LevitationController;
}
