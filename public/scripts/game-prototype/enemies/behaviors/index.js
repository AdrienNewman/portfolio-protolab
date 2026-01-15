// ============================================
// ENEMY BEHAVIOR REGISTRY - Central Export
// All enemy movement behaviors
// 10 behaviors extracted from Enemy.js
// ============================================

import { behaviorZigzag } from './zigzag.js';
import { behaviorFast } from './fast.js';
import { behaviorDiagonal } from './diagonal.js';
import { behaviorPhase } from './phase.js';
import { behaviorTeleport } from './teleport.js';
import { behaviorSwarm } from './swarm.js';
import { behaviorWave } from './wave.js';
import { behaviorErratic } from './erratic.js';
import { behaviorSlowTank } from './slowTank.js';
import { behaviorHeavy } from './heavy.js';

// Re-export individual behaviors
export {
    behaviorZigzag,
    behaviorFast,
    behaviorDiagonal,
    behaviorPhase,
    behaviorTeleport,
    behaviorSwarm,
    behaviorWave,
    behaviorErratic,
    behaviorSlowTank,
    behaviorHeavy
};

// Behavior handlers map (snake_case keys)
const behaviorHandlers = {
    'zigzag': behaviorZigzag,
    'fast': behaviorFast,
    'diagonal': behaviorDiagonal,
    'phase': behaviorPhase,
    'teleport': behaviorTeleport,
    'swarm': behaviorSwarm,
    'wave': behaviorWave,
    'erratic': behaviorErratic,
    'slow_tank': behaviorSlowTank,
    'heavy': behaviorHeavy
};

// Aggregated object with metadata
export const ENEMY_BEHAVIORS = {
    zigzag: {
        name: 'zigzag',
        description: 'Mouvement descendant avec oscillation horizontale sinusoïdale',
        handler: behaviorZigzag,
        params: {
            amplitude: { type: 'number', default: 3, description: 'Amplitude du zigzag' },
            frequency: { type: 'number', default: 3, description: 'Fréquence du zigzag' }
        }
    },
    fast: {
        name: 'fast',
        description: 'Mouvement rapide vers le bas',
        handler: behaviorFast,
        params: {
            speedMultiplier: { type: 'number', default: 1.2, description: 'Multiplicateur de vitesse' }
        }
    },
    diagonal: {
        name: 'diagonal',
        description: 'Mouvement diagonal avec rebond sur les bords',
        handler: behaviorDiagonal,
        params: {
            speedMultiplier: { type: 'number', default: 0.8, description: 'Multiplicateur vitesse X' },
            bounceMargin: { type: 'number', default: 50, description: 'Marge de rebond en pixels' }
        }
    },
    phase: {
        name: 'phase',
        description: 'Alternance visibilité/invisibilité',
        handler: behaviorPhase,
        params: {
            phaseInterval: { type: 'number', default: 60, description: 'Frames entre changements' }
        }
    },
    teleport: {
        name: 'teleport',
        description: 'Téléportation aléatoire horizontale',
        handler: behaviorTeleport,
        params: {
            teleportChance: { type: 'number', default: 0.01, description: 'Probabilité par frame' },
            cooldownFrames: { type: 'number', default: 60, description: 'Cooldown en frames' }
        }
    },
    swarm: {
        name: 'swarm',
        description: 'Petites unités rapides avec mouvement ondulant',
        handler: behaviorSwarm,
        params: {
            waveAmplitude: { type: 'number', default: 2, description: 'Amplitude de l\'onde' },
            waveFrequency: { type: 'number', default: 5, description: 'Fréquence de l\'onde' }
        }
    },
    wave: {
        name: 'wave',
        description: 'Mouvement horizontal ondulant large',
        handler: behaviorWave,
        params: {
            speedMultiplier: { type: 'number', default: 0.8, description: 'Multiplicateur vitesse Y' },
            waveAmplitude: { type: 'number', default: 4, description: 'Amplitude de l\'onde' },
            waveFrequency: { type: 'number', default: 2, description: 'Fréquence de l\'onde' }
        }
    },
    erratic: {
        name: 'erratic',
        description: 'Mouvement horizontal aléatoire imprévisible',
        handler: behaviorErratic,
        params: {
            randomness: { type: 'number', default: 8, description: 'Amplitude du mouvement aléatoire' },
            bounceMargin: { type: 'number', default: 50, description: 'Marge des bords' }
        }
    },
    slow_tank: {
        name: 'slow_tank',
        description: 'Mouvement lent et régulier (tank lourd)',
        handler: behaviorSlowTank,
        params: {
            speedMultiplier: { type: 'number', default: 0.7, description: 'Multiplicateur de vitesse' }
        }
    },
    heavy: {
        name: 'heavy',
        description: 'Mouvement lent avec légère oscillation',
        handler: behaviorHeavy,
        params: {
            speedMultiplier: { type: 'number', default: 0.8, description: 'Multiplicateur vitesse Y' },
            waveAmplitude: { type: 'number', default: 1.5, description: 'Amplitude oscillation' }
        }
    }
};

/**
 * Execute a behavior on an enemy
 * @param {object} enemy - Enemy instance
 * @param {string} behaviorType - Behavior type name
 * @param {object} params - Behavior parameters
 * @param {number} deltaTime - Time since last frame
 * @returns {object} Result with flags (phaseVisible, etc.)
 */
export function executeBehavior(enemy, behaviorType, params = {}, deltaTime) {
    const handler = behaviorHandlers[behaviorType];

    if (!handler) {
        // Fallback: straight down movement
        enemy.y += enemy.speed * enemy.slowMoMultiplier;
        return { overrideMovement: true };
    }

    return handler.update(enemy, params, deltaTime);
}

/**
 * Get behavior metadata by type
 * @param {string} behaviorType - Behavior type name
 * @returns {object|null} Behavior metadata or null
 */
export function getBehaviorConfig(behaviorType) {
    return ENEMY_BEHAVIORS[behaviorType] || null;
}

/**
 * Get all behavior type names
 * @returns {string[]} Array of behavior names
 */
export function getAllBehaviorTypes() {
    return Object.keys(ENEMY_BEHAVIORS);
}

/**
 * Check if a behavior type exists
 * @param {string} behaviorType - Behavior type to check
 * @returns {boolean}
 */
export function behaviorExists(behaviorType) {
    return behaviorType in behaviorHandlers;
}
