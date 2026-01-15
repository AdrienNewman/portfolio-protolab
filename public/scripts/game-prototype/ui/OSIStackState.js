// ============================================
// OSI STACK STATE - Symmetric HP Management
// "Poupee Russe" model with Header/Trailer
// V1.0 - Sprint B2
// ============================================

import { LAYER_HP, BLOCK_STATES } from './OSIStackConfig.js';

/**
 * OSIStackState - Manages HP for symmetric OSI layers
 *
 * Structure:
 * - L7 (CORE): Single block with 100 HP
 * - L6-L1: Header (50 HP) + Trailer (50 HP) each
 *
 * Damage flows from outer (L1) to inner (L7)
 * When hit: damage splits 50/50 between header and trailer
 */
export class OSIStackState {
    constructor() {
        this.layers = {};
        this._initLayers();

        // ===== CALLBACKS =====
        this.onBlockDamaged = null;     // (layer, blockType, hp, maxHp) => void
        this.onBlockDestroyed = null;   // (layer, blockType) => void
        this.onLayerDestroyed = null;   // (layer) => void
        this.onLayerUnlocked = null;    // (layer) => void
        this.onDeath = null;            // () => void
    }

    /**
     * Initialize all layers to default state
     * Only L7 starts unlocked
     */
    _initLayers() {
        for (let i = 7; i >= 1; i--) {
            const config = LAYER_HP[i];

            if (config.type === 'core') {
                // L7 = CORE unique
                this.layers[i] = {
                    type: 'core',
                    state: i === 7 ? BLOCK_STATES.HEALTHY : BLOCK_STATES.LOCKED,
                    core: {
                        hp: config.hp,
                        maxHp: config.hp,
                        state: i === 7 ? BLOCK_STATES.HEALTHY : BLOCK_STATES.LOCKED
                    }
                };
            } else {
                // L6-L1 = Symmetric header/trailer
                this.layers[i] = {
                    type: 'symmetric',
                    state: BLOCK_STATES.LOCKED,
                    header: {
                        hp: config.header,
                        maxHp: config.header,
                        state: BLOCK_STATES.LOCKED
                    },
                    trailer: {
                        hp: config.trailer,
                        maxHp: config.trailer,
                        state: BLOCK_STATES.LOCKED
                    }
                };
            }
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Unlock a new layer (called after boss defeat)
     * @param {number} layerNumber - Layer to unlock (1-6)
     * @returns {boolean} Success
     */
    addLayer(layerNumber) {
        const layer = this.layers[layerNumber];
        if (!layer || layer.state !== BLOCK_STATES.LOCKED) {
            return false;
        }

        layer.state = BLOCK_STATES.HEALTHY;

        if (layer.type === 'core') {
            layer.core.state = BLOCK_STATES.HEALTHY;
            layer.core.hp = layer.core.maxHp;
        } else {
            layer.header.state = BLOCK_STATES.HEALTHY;
            layer.header.hp = layer.header.maxHp;
            layer.trailer.state = BLOCK_STATES.HEALTHY;
            layer.trailer.hp = layer.trailer.maxHp;
        }

        if (this.onLayerUnlocked) {
            this.onLayerUnlocked(layerNumber);
        }

        return true;
    }

    /**
     * Handle incoming damage
     * Damage splits 50/50 between header and trailer of outer layer
     * @param {number} damage - Total damage to apply
     * @returns {{ absorbed: number, isDead: boolean, overflow: number }}
     */
    handleDamage(damage) {
        let remaining = damage;
        let totalAbsorbed = 0;

        while (remaining > 0) {
            const outerLayer = this._getOuterActiveLayer();

            if (outerLayer === null) {
                // All layers destroyed - should not happen if L7 triggers death
                if (this.onDeath) this.onDeath();
                return { absorbed: totalAbsorbed, isDead: true, overflow: remaining };
            }

            const layer = this.layers[outerLayer];

            if (layer.type === 'core') {
                // L7 CORE - Direct damage (no split)
                const absorbed = this._applyDamageToBlock(outerLayer, 'core', remaining);
                totalAbsorbed += absorbed;
                remaining -= absorbed;

                // Check death
                if (layer.core.state === BLOCK_STATES.DESTROYED) {
                    if (this.onDeath) this.onDeath();
                    return { absorbed: totalAbsorbed, isDead: true, overflow: remaining };
                }
            } else {
                // L6-L1 Symmetric - Split 50/50 between header and trailer
                const halfDamage = remaining / 2;

                const absorbedHeader = this._applyDamageToBlock(outerLayer, 'header', halfDamage);
                const absorbedTrailer = this._applyDamageToBlock(outerLayer, 'trailer', halfDamage);
                const absorbed = absorbedHeader + absorbedTrailer;

                totalAbsorbed += absorbed;
                remaining -= absorbed;

                // Check if entire layer destroyed
                if (this._isLayerFullyDestroyed(outerLayer)) {
                    if (this.onLayerDestroyed) {
                        this.onLayerDestroyed(outerLayer);
                    }
                    // Continue loop to apply overflow to next layer
                }
            }

            // Safety: if no damage absorbed, break to avoid infinite loop
            if (totalAbsorbed === 0 && remaining > 0) {
                break;
            }
        }

        return { absorbed: totalAbsorbed, isDead: false, overflow: 0 };
    }

    /**
     * Apply damage to a specific block
     * @private
     */
    _applyDamageToBlock(layerNum, blockType, damage) {
        const layer = this.layers[layerNum];
        const block = layer[blockType];

        if (!block || block.state === BLOCK_STATES.DESTROYED) {
            return 0;
        }

        const actualDamage = Math.min(block.hp, damage);
        block.hp -= actualDamage;

        // Update block state based on HP percentage
        this._updateBlockState(block);

        // Fire callback
        if (this.onBlockDamaged && actualDamage > 0) {
            this.onBlockDamaged(layerNum, blockType, block.hp, block.maxHp);
        }

        // Check destruction
        if (block.hp <= 0) {
            block.hp = 0;
            block.state = BLOCK_STATES.DESTROYED;
            if (this.onBlockDestroyed) {
                this.onBlockDestroyed(layerNum, blockType);
            }
        }

        return actualDamage;
    }

    /**
     * Update block visual state based on HP percentage
     * @private
     */
    _updateBlockState(block) {
        if (block.state === BLOCK_STATES.DESTROYED || block.state === BLOCK_STATES.LOCKED) {
            return;
        }

        const hpPercent = block.hp / block.maxHp;

        if (hpPercent <= 0) {
            block.state = BLOCK_STATES.DESTROYED;
        } else if (hpPercent < 0.25) {
            block.state = BLOCK_STATES.CRITICAL;
        } else if (hpPercent < 0.5) {
            block.state = BLOCK_STATES.DAMAGED;
        } else {
            block.state = BLOCK_STATES.HEALTHY;
        }
    }

    /**
     * Get the outermost active (not destroyed, not locked) layer
     * Damage flows L1 -> L7 (outer to inner)
     * @private
     */
    _getOuterActiveLayer() {
        for (let i = 1; i <= 7; i++) {
            const layer = this.layers[i];
            if (layer.state !== BLOCK_STATES.LOCKED && !this._isLayerFullyDestroyed(i)) {
                return i;
            }
        }
        return null;
    }

    /**
     * Check if a layer is fully destroyed
     * For symmetric: both header AND trailer must be destroyed
     * @private
     */
    _isLayerFullyDestroyed(layerNum) {
        const layer = this.layers[layerNum];

        if (layer.type === 'core') {
            return layer.core.state === BLOCK_STATES.DESTROYED;
        }

        // Symmetric: both header AND trailer must be destroyed
        return layer.header.state === BLOCK_STATES.DESTROYED &&
               layer.trailer.state === BLOCK_STATES.DESTROYED;
    }

    // ============================================
    // GETTERS
    // ============================================

    /**
     * Get all layer states for rendering
     */
    getAllLayerStates() {
        return { ...this.layers };
    }

    /**
     * Get unlocked layer numbers in order (for rendering)
     * Returns array like [7] or [7, 6] or [7, 6, 5, 4, 3, 2, 1]
     */
    getUnlockedLayers() {
        const unlocked = [];
        for (let i = 7; i >= 1; i--) {
            if (this.layers[i].state !== BLOCK_STATES.LOCKED) {
                unlocked.push(i);
            }
        }
        return unlocked;
    }

    /**
     * Get total remaining HP across all unlocked layers
     */
    getTotalHealth() {
        let total = 0;
        for (let i = 7; i >= 1; i--) {
            const layer = this.layers[i];
            if (layer.state === BLOCK_STATES.LOCKED) continue;

            if (layer.type === 'core') {
                if (layer.core.state !== BLOCK_STATES.DESTROYED) {
                    total += layer.core.hp;
                }
            } else {
                if (layer.header.state !== BLOCK_STATES.DESTROYED) {
                    total += layer.header.hp;
                }
                if (layer.trailer.state !== BLOCK_STATES.DESTROYED) {
                    total += layer.trailer.hp;
                }
            }
        }
        return total;
    }

    /**
     * Get max possible HP across all unlocked layers
     */
    getMaxHealth() {
        let total = 0;
        for (let i = 7; i >= 1; i--) {
            const layer = this.layers[i];
            if (layer.state === BLOCK_STATES.LOCKED) continue;

            if (layer.type === 'core') {
                total += layer.core.maxHp;
            } else {
                total += layer.header.maxHp + layer.trailer.maxHp;
            }
        }
        return total;
    }

    /**
     * Check if player is dead (L7 core destroyed)
     */
    isDead() {
        return this.layers[7].core.state === BLOCK_STATES.DESTROYED;
    }

    /**
     * Reset to initial state (new game)
     */
    reset() {
        this._initLayers();
    }
}
