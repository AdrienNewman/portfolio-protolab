// ============================================
// OSI STACK ANIMATIONS - Visual Effects
// Handles flash, destruction, unlock animations
// V1.0 - Sprint B2
// ============================================

import { ANIMATION_TIMING } from './OSIStackConfig.js';

/**
 * OSIStackAnimations - Manages animation states per block
 *
 * Each block can have multiple concurrent animations:
 * - Flash (red overlay on damage)
 * - Destruction (explosion particles)
 * - Unlock (appearance animation)
 * - Critical flicker (pulsing when low HP)
 */
export class OSIStackAnimations {
    constructor() {
        this.layers = {};
        this._initAnimations();

        // Global pulse phase for synchronized effects
        this.pulsePhase = 0;
    }

    /**
     * Initialize animation states for all layers
     */
    _initAnimations() {
        for (let i = 7; i >= 1; i--) {
            if (i === 7) {
                this.layers[i] = {
                    core: this._createBlockAnim()
                };
            } else {
                this.layers[i] = {
                    header: this._createBlockAnim(),
                    trailer: this._createBlockAnim()
                };
            }
        }
    }

    /**
     * Create default animation state for a block
     * @private
     */
    _createBlockAnim() {
        return {
            // Damage flash
            isFlashing: false,
            flashAlpha: 0,
            flashTimer: 0,
            flashCount: 0,

            // Destruction explosion
            isDestroying: false,
            destructionProgress: 0,
            destructionParticles: [],

            // Unlock appearance
            isUnlocking: false,
            unlockProgress: 0,

            // Critical state flicker
            flickerPhase: Math.random() * Math.PI * 2
        };
    }

    // ============================================
    // TRIGGER ANIMATIONS
    // ============================================

    /**
     * Trigger damage flash on a block
     * Flashes red 3 times
     */
    triggerDamageFlash(layer, blockType) {
        const anim = this.layers[layer]?.[blockType];
        if (!anim) return;

        anim.isFlashing = true;
        anim.flashTimer = ANIMATION_TIMING.DAMAGE_FLASH_DURATION;
        anim.flashAlpha = 0.6;
        anim.flashCount = ANIMATION_TIMING.DAMAGE_FLASH_COUNT;
    }

    /**
     * Trigger destruction animation on a block
     * Spawns particles that explode outward
     */
    triggerDestruction(layer, blockType) {
        const anim = this.layers[layer]?.[blockType];
        if (!anim) return;

        anim.isDestroying = true;
        anim.destructionProgress = 0;

        // Create explosion particles
        anim.destructionParticles = [];
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            anim.destructionParticles.push({
                angle,
                speed: 30 + Math.random() * 20,
                size: 3 + Math.random() * 3,
                distance: 0
            });
        }
    }

    /**
     * Trigger unlock animation for a layer
     * Both header and trailer animate simultaneously
     */
    triggerUnlock(layer) {
        const layerAnim = this.layers[layer];
        if (!layerAnim) return;

        Object.values(layerAnim).forEach(anim => {
            anim.isUnlocking = true;
            anim.unlockProgress = 0;
        });
    }

    // ============================================
    // UPDATE
    // ============================================

    /**
     * Update all animations
     * @param {number} deltaTime - Time since last frame (ms)
     */
    update(deltaTime) {
        // Global pulse
        this.pulsePhase += ANIMATION_TIMING.PULSE_SPEED * deltaTime;
        if (this.pulsePhase > Math.PI * 2) {
            this.pulsePhase -= Math.PI * 2;
        }

        // Update each block's animations
        for (let i = 7; i >= 1; i--) {
            const layerAnim = this.layers[i];
            Object.values(layerAnim).forEach(anim => {
                this._updateBlockAnim(anim, deltaTime);
            });
        }
    }

    /**
     * Update a single block's animations
     * @private
     */
    _updateBlockAnim(anim, deltaTime) {
        // ===== Damage Flash =====
        if (anim.isFlashing) {
            anim.flashTimer -= deltaTime;

            if (anim.flashTimer <= 0) {
                anim.flashCount--;
                if (anim.flashCount > 0) {
                    // Start next flash
                    anim.flashTimer = ANIMATION_TIMING.DAMAGE_FLASH_DURATION;
                    anim.flashAlpha = 0.6;
                } else {
                    // Done flashing
                    anim.isFlashing = false;
                    anim.flashAlpha = 0;
                }
            } else {
                // Fade out current flash
                const progress = anim.flashTimer / ANIMATION_TIMING.DAMAGE_FLASH_DURATION;
                anim.flashAlpha = 0.6 * progress;
            }
        }

        // ===== Destruction =====
        if (anim.isDestroying) {
            anim.destructionProgress += deltaTime / ANIMATION_TIMING.DESTRUCTION_DURATION;

            // Update particles
            anim.destructionParticles.forEach(p => {
                p.distance += p.speed * (deltaTime / 1000);
            });

            if (anim.destructionProgress >= 1) {
                anim.isDestroying = false;
                anim.destructionProgress = 0;
                anim.destructionParticles = [];
            }
        }

        // ===== Unlock =====
        if (anim.isUnlocking) {
            anim.unlockProgress += deltaTime / ANIMATION_TIMING.UNLOCK_DURATION;

            if (anim.unlockProgress >= 1) {
                anim.isUnlocking = false;
                anim.unlockProgress = 0;
            }
        }

        // ===== Critical Flicker =====
        anim.flickerPhase += ANIMATION_TIMING.CRITICAL_FLICKER_SPEED;
        if (anim.flickerPhase > Math.PI * 2) {
            anim.flickerPhase -= Math.PI * 2;
        }
    }

    // ============================================
    // GETTERS
    // ============================================

    /**
     * Get all animation states for rendering
     */
    getAllAnimations() {
        return this.layers;
    }

    /**
     * Get animation state for a specific block
     */
    getBlockAnim(layer, blockType) {
        return this.layers[layer]?.[blockType] || null;
    }

    /**
     * Get current pulse value (0-1 oscillating)
     */
    getPulseValue() {
        return (Math.sin(this.pulsePhase) + 1) / 2;
    }

    /**
     * Reset all animations
     */
    reset() {
        this._initAnimations();
        this.pulsePhase = 0;
    }
}
