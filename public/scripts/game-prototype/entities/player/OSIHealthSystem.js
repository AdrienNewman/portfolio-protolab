// ============================================
// OSI HEALTH SYSTEM - "Poupée Russe" Model
//
// ORDRE RÉSEAU (comme un vrai paquet) :
// - L7 (Application) = CORE au centre (données)
// - L1 (Physical) = SHELL externe (câble)
//
// Les dégâts traversent de l'EXTÉRIEUR (L1)
// vers l'INTÉRIEUR (L7 = core données).
//
// Quand une couche atteint 0 HP :
// → Elle est détruite visuellement
// → Les dégâts passent à la couche suivante (vers le centre)
// → Si L7 (core) meurt → Game Over
// ============================================

import { CONFIG, OSI_COLORS } from '../../config/gameConfig.js';

// États possibles d'une couche
const LAYER_STATES = {
    LOCKED: 'locked',       // Pas encore débloquée
    UNLOCKED: 'unlocked',   // Active et intacte
    DAMAGED: 'damaged',     // HP < 50% (feedback visuel)
    DESTROYED: 'destroyed'  // HP = 0, plus de protection
};

export class OSIHealthSystem {
    constructor() {
        // Récupère la config HP par couche
        const layerHpConfig = CONFIG.PLAYER_OSI?.LAYER_HP || {
            7: 20, 6: 15, 5: 15, 4: 15, 3: 15, 2: 10, 1: 10
        };

        // Initialise les 7 couches
        // Au départ : seule L7 (core/données) est débloquée
        // Les couches externes (L6→L1) s'unlockent en battant les boss
        this.layers = {};
        for (let i = 7; i >= 1; i--) {
            this.layers[i] = {
                hp: layerHpConfig[i],
                maxHp: layerHpConfig[i],
                state: i === 7 ? LAYER_STATES.UNLOCKED : LAYER_STATES.LOCKED
            };
        }

        // ===== CALLBACKS (wiring externe) =====
        this.onLayerDestroyed = null;  // (layerNumber) => void
        this.onLayerDamaged = null;    // (layerNumber, remainingHp, maxHp) => void
        this.onDeath = null;           // () => void
    }

    // ============================================
    // API PUBLIQUE - Compatibilité avec Player.js
    // ============================================

    /**
     * Retourne le total HP actuel (toutes couches débloquées)
     * Utilisé pour la barre de vie et les checks de mort
     */
    getTotalHealth() {
        let total = 0;
        for (let i = 7; i >= 1; i--) {
            const layer = this.layers[i];
            if (layer.state !== LAYER_STATES.LOCKED && layer.state !== LAYER_STATES.DESTROYED) {
                total += layer.hp;
            }
        }
        return total;
    }

    /**
     * Retourne le max HP (toutes couches débloquées)
     */
    getMaxHealth() {
        let total = 0;
        for (let i = 7; i >= 1; i--) {
            const layer = this.layers[i];
            if (layer.state !== LAYER_STATES.LOCKED) {
                total += layer.maxHp;
            }
        }
        return total;
    }

    /**
     * Applique des dégâts selon le modèle poupée russe
     * ORDRE : L1 (externe) → L7 (core)
     * @param {number} amount - Dégâts à infliger
     * @returns {{ absorbed: number, isDead: boolean, layersDestroyed: number[] }}
     */
    takeDamage(amount) {
        let remaining = amount;
        const layersDestroyed = [];

        // Parcourt de L1 (externe) vers L7 (core)
        // Les dégâts frappent d'abord la couche physique (câble)
        // puis remontent vers les données (application)
        for (let i = 1; i <= 7 && remaining > 0; i++) {
            const layer = this.layers[i];

            // Skip les couches non-actives
            if (layer.state === LAYER_STATES.LOCKED || layer.state === LAYER_STATES.DESTROYED) {
                continue;
            }

            // Applique les dégâts à cette couche
            const damageToApply = Math.min(remaining, layer.hp);
            layer.hp -= damageToApply;
            remaining -= damageToApply;

            // Met à jour l'état
            if (layer.hp <= 0) {
                layer.hp = 0;
                layer.state = LAYER_STATES.DESTROYED;
                layersDestroyed.push(i);

                // Callback destruction
                if (this.onLayerDestroyed) {
                    this.onLayerDestroyed(i);
                }
            } else if (layer.hp < layer.maxHp * 0.5) {
                layer.state = LAYER_STATES.DAMAGED;
            }

            // Callback dégâts (même si pas détruit)
            if (this.onLayerDamaged && damageToApply > 0) {
                this.onLayerDamaged(i, layer.hp, layer.maxHp);
            }
        }

        // Vérifie si le CORE (L7) est détruit = Game Over
        const isDead = this.layers[7].state === LAYER_STATES.DESTROYED;
        if (isDead && this.onDeath) {
            this.onDeath();
        }

        return {
            absorbed: amount - remaining,
            isDead,
            layersDestroyed
        };
    }

    /**
     * Soigne le joueur - couche externe endommagée d'abord
     * ORDRE : L1 (externe) → L7 (core)
     * @param {number} amount - HP à restaurer
     */
    heal(amount) {
        let remaining = amount;

        // Parcourt de L1 (externe) vers L7 (core)
        // Soigne les couches endommagées mais pas détruites
        for (let i = 1; i <= 7 && remaining > 0; i++) {
            const layer = this.layers[i];

            // Skip locked/destroyed
            if (layer.state === LAYER_STATES.LOCKED || layer.state === LAYER_STATES.DESTROYED) {
                continue;
            }

            // Calcule combien on peut soigner
            const healable = layer.maxHp - layer.hp;
            if (healable > 0) {
                const healAmount = Math.min(remaining, healable);
                layer.hp += healAmount;
                remaining -= healAmount;

                // Remet l'état à unlocked si >= 50%
                if (layer.hp >= layer.maxHp * 0.5) {
                    layer.state = LAYER_STATES.UNLOCKED;
                }
            }
        }
    }

    // ============================================
    // GESTION DES COUCHES
    // ============================================

    /**
     * Débloque une couche (appelé après défaite d'un boss)
     * @param {number} layerNumber - Numéro de couche (1-7)
     */
    unlockLayer(layerNumber) {
        const layer = this.layers[layerNumber];
        if (layer && layer.state === LAYER_STATES.LOCKED) {
            layer.state = LAYER_STATES.UNLOCKED;
            layer.hp = layer.maxHp; // Full HP à l'unlock
            return true;
        }
        return false;
    }

    /**
     * Retourne l'état d'une couche spécifique
     * @param {number} layerNumber
     * @returns {{ hp, maxHp, state, color, glow }}
     */
    getLayerState(layerNumber) {
        const layer = this.layers[layerNumber];
        const colors = OSI_COLORS[layerNumber] || {};
        return {
            ...layer,
            color: colors.color || '#ffffff',
            glow: colors.glow || 'rgba(255,255,255,0.5)',
            name: colors.name || `LAYER ${layerNumber}`
        };
    }

    /**
     * Retourne l'état de toutes les couches (pour le renderer)
     * @returns {Object} Map layer number → state object
     */
    getAllLayerStates() {
        const states = {};
        for (let i = 7; i >= 1; i--) {
            states[i] = this.getLayerState(i);
        }
        return states;
    }

    /**
     * Trouve la couche externe active (qui prendra les prochains dégâts)
     * ORDRE : L1 (externe) est la première ligne de défense
     * @returns {number|null} Numéro de couche ou null si toutes détruites
     */
    getOutermostActiveLayer() {
        // L1 est externe, L7 est le core
        for (let i = 1; i <= 7; i++) {
            const layer = this.layers[i];
            if (layer.state === LAYER_STATES.UNLOCKED || layer.state === LAYER_STATES.DAMAGED) {
                return i;
            }
        }
        return null;
    }

    // ============================================
    // SÉRIALISATION (Save/Load ready)
    // ============================================

    serialize() {
        return JSON.stringify({
            layers: this.layers
        });
    }

    deserialize(data) {
        try {
            const parsed = JSON.parse(data);
            if (parsed.layers) {
                this.layers = parsed.layers;
            }
        } catch (e) {
            console.error('[OSIHealthSystem] Deserialize error:', e);
        }
    }

    /**
     * Reset complet (nouvelle partie)
     */
    reset() {
        const layerHpConfig = CONFIG.PLAYER_OSI?.LAYER_HP || {
            7: 20, 6: 15, 5: 15, 4: 15, 3: 15, 2: 10, 1: 10
        };

        for (let i = 7; i >= 1; i--) {
            this.layers[i] = {
                hp: layerHpConfig[i],
                maxHp: layerHpConfig[i],
                state: i === 7 ? LAYER_STATES.UNLOCKED : LAYER_STATES.LOCKED
            };
        }
    }
}

// Export des états pour usage externe
export { LAYER_STATES };
