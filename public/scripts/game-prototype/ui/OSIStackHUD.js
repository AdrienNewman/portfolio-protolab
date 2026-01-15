// ============================================
// OSI STACK HUD - Main Coordinator
// Vertical HUD showing symmetric OSI layers
// Position: Left side of screen
// V1.0 - Sprint B2
// ============================================

import { OSIStackState } from './OSIStackState.js';
import { OSIStackRenderer } from './OSIStackRenderer.js';
import { OSIStackAnimations } from './OSIStackAnimations.js';
import { BOSS_TO_LAYER } from './OSIStackConfig.js';

/**
 * OSIStackHUD - Orchestrates state, rendering, and animations
 *
 * Usage:
 * 1. Create in NetDefender constructor: this.osiStackHUD = new OSIStackHUD(this)
 * 2. Call update(deltaTime) in game update loop
 * 3. Call render() in game render loop
 * 4. Replace player.takeDamage() with osiStackHUD.handleDamage()
 * 5. Call addLayer() after boss defeat
 */
export class OSIStackHUD {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;

        // Initialize modules
        this.state = new OSIStackState();
        this.renderer = new OSIStackRenderer(this.ctx, this.canvas);
        this.animations = new OSIStackAnimations();

        // Wire callbacks between modules
        this._wireCallbacks();

        // Active flag (can disable HUD temporarily)
        this.active = true;

        // Debug logging
        this.debug = false;
    }

    /**
     * Wire callbacks from State to Animations and Game
     * @private
     */
    _wireCallbacks() {
        // Block damaged -> trigger flash animation
        this.state.onBlockDamaged = (layer, blockType, hp, maxHp) => {
            this.animations.triggerDamageFlash(layer, blockType);

            // Light screen shake on damage
            if (this.game.screenShake) {
                const intensity = hp < maxHp * 0.25 ? 'medium' : 'light';
                if (intensity === 'medium') {
                    this.game.screenShake.trigger?.(8, 150) || this.game.screenShake.triggerMedium?.();
                } else {
                    this.game.screenShake.trigger?.(4, 100) || this.game.screenShake.triggerLight?.();
                }
            }

            if (this.debug) {
                console.log(`[OSIStackHUD] Block damaged: L${layer}-${blockType} ${hp}/${maxHp}`);
            }
        };

        // Block destroyed -> trigger explosion animation
        this.state.onBlockDestroyed = (layer, blockType) => {
            this.animations.triggerDestruction(layer, blockType);

            // Heavy screen shake
            if (this.game.screenShake) {
                this.game.screenShake.trigger?.(12, 250) || this.game.screenShake.triggerHeavy?.();
            }

            // Play explosion sound
            if (this.game.audioManager) {
                this.game.audioManager.playExplosion?.(false);
            }

            if (this.debug) {
                console.log(`[OSIStackHUD] Block destroyed: L${layer}-${blockType}`);
            }
        };

        // Layer fully destroyed -> log event
        this.state.onLayerDestroyed = (layer) => {
            console.log(`[OSIStackHUD] Layer ${layer} fully destroyed!`);

            // Could trigger special effects here
            if (this.game.particleSystem) {
                // Large particle burst could be added
            }
        };

        // Layer unlocked -> trigger unlock animation
        this.state.onLayerUnlocked = (layer) => {
            this.animations.triggerUnlock(layer);

            if (this.debug) {
                console.log(`[OSIStackHUD] Layer ${layer} unlocked!`);
            }
        };

        // Player death (L7 core destroyed)
        this.state.onDeath = () => {
            console.log('[OSIStackHUD] Player died - L7 core destroyed!');
            // Game over is handled by the game loop checking isDead
        };
    }

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Handle incoming damage to the player
     * Replaces player.takeDamage() for HUD-based health
     *
     * @param {number} damage - Amount of damage to apply
     * @returns {boolean} True if player died
     */
    handleDamage(damage) {
        if (!this.active) return false;

        const result = this.state.handleDamage(damage);
        return result.isDead;
    }

    /**
     * Add/unlock a new layer after boss defeat
     *
     * @param {number|string} layerOrBossId - Layer number (1-6) or boss ID string
     * @returns {boolean} True if layer was unlocked
     */
    addLayer(layerOrBossId) {
        let layerNumber;

        // Handle boss ID string
        if (typeof layerOrBossId === 'string') {
            layerNumber = BOSS_TO_LAYER[layerOrBossId];
            if (!layerNumber) {
                console.warn(`[OSIStackHUD] Unknown boss ID: ${layerOrBossId}`);
                return false;
            }
        } else {
            layerNumber = layerOrBossId;
        }

        const success = this.state.addLayer(layerNumber);

        if (success) {
            console.log(`[OSIStackHUD] Layer ${layerNumber} added to stack!`);
        }

        return success;
    }

    /**
     * Get total remaining health
     * @returns {number}
     */
    getTotalHealth() {
        return this.state.getTotalHealth();
    }

    /**
     * Get maximum possible health
     * @returns {number}
     */
    getMaxHealth() {
        return this.state.getMaxHealth();
    }

    /**
     * Check if player is dead
     * @returns {boolean}
     */
    isDead() {
        return this.state.isDead();
    }

    /**
     * Get current unlocked layer count
     * @returns {number}
     */
    getUnlockedLayerCount() {
        return this.state.getUnlockedLayers().length;
    }

    // ============================================
    // GAME LOOP METHODS
    // ============================================

    /**
     * Update animations
     * Call this in the game update loop
     *
     * @param {number} deltaTime - Time since last frame (ms)
     */
    update(deltaTime) {
        if (!this.active) return;
        this.animations.update(deltaTime);
    }

    /**
     * Render the HUD
     * Call this in the game render loop (after game objects, before overlays)
     */
    render() {
        if (!this.active) return;

        const layerStates = this.state.getAllLayerStates();
        const animations = this.animations.getAllAnimations();
        const unlockedLayers = this.state.getUnlockedLayers();

        this.renderer.render(layerStates, animations, unlockedLayers);
    }

    // ============================================
    // STATE MANAGEMENT
    // ============================================

    /**
     * Reset to initial state (new game)
     */
    reset() {
        this.state.reset();
        this.animations.reset();
        this.active = true;
    }

    /**
     * Enable/disable the HUD
     * @param {boolean} active
     */
    setActive(active) {
        this.active = active;
    }

    /**
     * Enable/disable debug logging
     * @param {boolean} enabled
     */
    setDebug(enabled) {
        this.debug = enabled;
    }
}

// Default export
export default OSIStackHUD;
