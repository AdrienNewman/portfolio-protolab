// ============================================
// ENEMY VISUALS REGISTRY - Central Export
// All enemy drawing functions
// 3 visual types: standard, tank, swarm
// ============================================

import { drawStandard } from './standard.js';
import { drawTank } from './tank.js';
import { drawSwarm } from './swarm.js';

// Re-export individual visuals
export {
    drawStandard,
    drawTank,
    drawSwarm
};

// Visual handlers map
const visualHandlers = {
    'standard': drawStandard,
    'tank': drawTank,
    'swarm': drawSwarm
};

// Aggregated object with metadata
export const ENEMY_VISUALS = {
    standard: {
        name: 'standard',
        description: 'Forme losange classique (diamond)',
        handler: drawStandard
    },
    tank: {
        name: 'tank',
        description: 'Forme carrée lourde avec accents aux coins',
        handler: drawTank
    },
    swarm: {
        name: 'swarm',
        description: 'Petit triangle rapide',
        handler: drawSwarm
    }
};

/**
 * Draw an enemy using its visual type
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} enemy - Enemy instance
 * @param {string} color - Display color (may be flash white)
 */
export function drawEnemy(ctx, enemy, color) {
    const visualType = enemy.visual || 'standard';
    const handler = visualHandlers[visualType];

    if (handler) {
        handler(ctx, enemy, color);
    } else {
        // Fallback to standard
        drawStandard(ctx, enemy, color);
    }
}

/**
 * Get visual metadata by type
 * @param {string} visualType - Visual type name
 * @returns {object|null} Visual metadata or null
 */
export function getVisualConfig(visualType) {
    return ENEMY_VISUALS[visualType] || null;
}

/**
 * Get all visual type names
 * @returns {string[]} Array of visual names
 */
export function getAllVisualTypes() {
    return Object.keys(ENEMY_VISUALS);
}
