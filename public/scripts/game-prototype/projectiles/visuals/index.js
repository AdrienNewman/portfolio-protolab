// ============================================
// PROJECTILE VISUALS REGISTRY - Central Export
// All projectile drawing functions
// ============================================

import { drawDefault } from './default.js';
import { drawBullet } from './bullet.js';
import { drawLetter } from './letter.js';
import { drawPopup } from './popup.js';
import { drawActivex } from './activex.js';
import { drawHoming } from './homing.js';
import { drawDebris } from './debris.js';
import { drawWave } from './wave.js';
import { drawRapid } from './rapid.js';
import { drawRain } from './rain.js';
import { drawEmoticon } from './emoticon.js';

// Re-export individual visuals
export {
    drawDefault,
    drawBullet,
    drawLetter,
    drawPopup,
    drawActivex,
    drawHoming,
    drawDebris,
    drawWave,
    drawRapid,
    drawRain,
    drawEmoticon
};

// Visual handlers map
const visualHandlers = {
    'default': drawDefault,
    'bullet': drawBullet,
    'letter': drawLetter,
    'popup': drawPopup,
    'popup_window': drawPopup,
    'activex': drawActivex,
    'homing': drawHoming,
    'debris': drawDebris,
    'wave': drawWave,
    'rapid': drawRapid,
    'rain': drawRain,
    'emoticon': drawEmoticon
};

// Type to visual mapping (for projectile.type field)
const typeToVisualMap = {
    'default': 'default',
    'burst': 'bullet',
    'spread': 'bullet',
    'aimed': 'bullet',
    'homing': 'homing',
    'debris': 'debris',
    'wave': 'wave',
    'rapid': 'rapid',
    'rain': 'rain'
};

// Aggregated object with metadata
export const PROJECTILE_VISUALS = {
    default: {
        name: 'default',
        description: 'Cercle avec noyau lumineux',
        handler: drawDefault
    },
    bullet: {
        name: 'bullet',
        description: 'Forme allongée style balle',
        handler: drawBullet
    },
    letter: {
        name: 'letter',
        description: 'Lettre EULA sur fond bleu',
        handler: drawLetter
    },
    popup: {
        name: 'popup',
        description: 'Fenêtre popup Windows',
        handler: drawPopup
    },
    activex: {
        name: 'activex',
        description: 'Hexagone composant ActiveX',
        handler: drawActivex
    },
    homing: {
        name: 'homing',
        description: 'Triangle missile',
        handler: drawHoming
    },
    debris: {
        name: 'debris',
        description: 'Polygone irrégulier rotatif',
        handler: drawDebris
    },
    wave: {
        name: 'wave',
        description: 'Anneau concentrique',
        handler: drawWave
    },
    rapid: {
        name: 'rapid',
        description: 'Petit cercle rapide',
        handler: drawRapid
    },
    rain: {
        name: 'rain',
        description: 'Goutte de pluie',
        handler: drawRain
    },
    emoticon: {
        name: 'emoticon',
        description: 'Emoticon MSN style',
        handler: drawEmoticon
    }
};

/**
 * Draw a projectile using its visual type
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} projectile - Projectile instance
 */
export function drawProjectile(ctx, projectile) {
    // First check projectileType (custom visuals like letter, popup)
    if (projectile.projectileType && visualHandlers[projectile.projectileType]) {
        visualHandlers[projectile.projectileType](ctx, projectile);
        return;
    }

    // Then check type (render style like burst, wave)
    const visualType = typeToVisualMap[projectile.type] || 'default';
    const handler = visualHandlers[visualType];

    if (handler) {
        handler(ctx, projectile);
    } else {
        drawDefault(ctx, projectile);
    }
}

/**
 * Get visual metadata by type
 * @param {string} visualType - Visual type name
 * @returns {object|null} Visual metadata or null
 */
export function getVisualConfig(visualType) {
    return PROJECTILE_VISUALS[visualType] || null;
}

/**
 * Get all visual type names
 * @returns {string[]} Array of visual names
 */
export function getAllVisualTypes() {
    return Object.keys(PROJECTILE_VISUALS);
}
