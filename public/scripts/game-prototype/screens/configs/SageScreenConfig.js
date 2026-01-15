// ============================================
// SAGE SCREEN CONFIG - Configuration Centralisée
// Layout, timings, styles pour SageScreen
// V1.0 - Epic Portrait Refactoring
// ============================================

/**
 * ANIMATION TIMINGS - Durées des phases en millisecondes
 */
export const ANIMATION_TIMING = {
    // Transitions
    FADE_IN_DURATION: 800,
    FADE_OUT_DURATION: 500,
    PORTRAIT_APPEAR_DURATION: 600,

    // Badges
    BADGE_APPEAR_DURATION: 400,
    BADGE_APPEAR_DELAY: 150,
    SELECTION_FLASH_DURATION: 600,

    // Typewriter
    CHAR_SPEED: 30,           // ms par caractère
    SKIP_MULTIPLIER: 3,       // Accélération avec ENTER

    // Animations continues
    GLOW_PULSE_SPEED: 0.003,
    FLOAT_SPEED: 0.8,
    BREATH_SPEED: 1.2,
    CURSOR_BLINK_SPEED: 500
};

// ============================================
// LAYOUTS - Deux modes distincts
// ============================================

/**
 * LAYOUT MODE DIALOGUE - Portrait GRAND et CENTRE + zone texte en bas
 * Utilisé pour l'intro Jimmy et les dialogues post-boss
 */
export const LAYOUT_DIALOGUE = {
    PORTRAIT: {
        CENTER_Y_PERCENT: 0.42,       // CENTRE vertical (pas en haut!)
        SIZE_FACTOR_W: 0.50,          // 50% largeur canvas = GRAND
        SIZE_FACTOR_H: 0.55,          // 55% hauteur canvas = GRAND
        FLOAT_AMPLITUDE: 8,           // Pixels animation float
        BREATH_SCALE: 0.012           // Intensité respiration
    },
    NAME_FRAME: {
        WIDTH: 360,
        HEIGHT: 75,
        OFFSET_Y: -55                 // Au-dessus du portrait
    },
    TEXT: {
        Y_PERCENT: 0.68,              // Zone texte remontée pour 3+ lignes
        WIDTH_PERCENT: 0.85,          // 85% largeur (plus large)
        MAX_LINES: 4,                 // 4 lignes par page
        FONT_SIZE: 18,                // Légèrement réduit pour plus de lignes
        LINE_HEIGHT: 1.4
    },
    INSTRUCTIONS: {
        Y_PERCENT: 0.94,              // Tout en bas
        MARGIN_LEFT: 40
    }
};

/**
 * LAYOUT MODE CHOIX - Portrait CENTRE + badges de part et d'autre
 * Utilisé pour la sélection de pouvoir après dialogue
 */
export const LAYOUT_CHOICE = {
    PORTRAIT: {
        CENTER_Y_PERCENT: 0.42,       // Centré verticalement comme en mode dialogue
        SIZE_FACTOR_W: 0.35,          // Réduit pour laisser place aux badges
        SIZE_FACTOR_H: 0.40,
        FLOAT_AMPLITUDE: 6,
        BREATH_SCALE: 0.01
    },
    NAME_FRAME: {
        WIDTH: 340,
        HEIGHT: 70,
        OFFSET_Y: -50
    },
    PROMPT: {
        Y_PERCENT: 0.12,              // "Choisis ton enseignement" en haut
        FONT_SIZE: 18
    },
    BADGES: {
        Y_PERCENT: 0.42,              // Centré verticalement avec le portrait
        WIDTH: 140,                   // Taille réduite pour tenir sur les côtés
        HEIGHT: 180,
        LEFT_X_PERCENT: 0.12,         // Badge gauche près du bord
        RIGHT_X_PERCENT: 0.88         // Badge droite près du bord
    },
    INSTRUCTIONS: {
        Y_PERCENT: 0.94,
        MARGIN_LEFT: 40
    }
};

// ============================================
// VISUAL - Effets visuels et typographie
// ============================================

export const VISUAL = {
    // Background
    BACKGROUND_DEFAULT: '#0a0a1a',
    VIGNETTE_STOPS: [0, 0.5, 0.8, 1],
    VIGNETTE_ALPHAS: [0, 0.2, 0.4, 0.7],

    // Portrait hologramme
    AURA_RINGS: 3,
    AURA_RING_SPACING: 15,
    SCANLINE_SPACING: 4,
    SCANLINE_ALPHA: 0.25,
    GLITCH_CHANCE: 0.016,             // 1.6% par frame

    // Glow
    GLOW_BASE: 0.5,
    GLOW_AMPLITUDE: 0.3,

    // Typographie
    FONTS: {
        NAME: 'bold 32px "Bebas Neue", Arial, sans-serif',
        TITLE: '16px "Space Mono", monospace',
        DIALOGUE: '18px "Space Mono", monospace',
        BADGE_ICON: '48px "Space Mono", monospace',
        BADGE_NAME: 'bold 20px "Bebas Neue", Arial, sans-serif',
        BADGE_DESC: '12px "Space Mono", monospace',
        BADGE_STATS: '11px "Space Mono", monospace',
        BADGE_RARITY: '11px "Space Mono", monospace',
        INSTRUCTIONS: '14px "Space Mono", monospace',
        PROMPT: '18px "Space Mono", monospace'
    }
};

// ============================================
// PARTICLES - Configuration particules ambiantes
// ============================================

export const PARTICLES = {
    COUNT: 50,
    MIN_SIZE: 1,
    MAX_SIZE: 4,
    SPEED_Y_RANGE: 0.5,
    SPEED_X_RANGE: 0.3,
    ALPHA_MIN: 0.2,
    ALPHA_MAX: 0.7
};

// ============================================
// RARITY COLORS - Couleurs de rareté des pouvoirs
// ============================================

export const RARITY_COLORS = {
    common: '#00ff88',
    uncommon: '#00ffff',
    rare: '#ff00ff',
    legendary: '#FFE81F'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Récupère le layout selon le mode
 * @param {'dialogue' | 'choice'} mode
 * @returns {object}
 */
export function getLayout(mode) {
    return mode === 'choice' ? LAYOUT_CHOICE : LAYOUT_DIALOGUE;
}

/**
 * Calcule la taille du portrait (adaptative au canvas)
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {'dialogue' | 'choice'} mode
 * @returns {number}
 */
export function calculatePortraitSize(canvasWidth, canvasHeight, mode = 'dialogue') {
    const layout = getLayout(mode);
    return Math.min(
        canvasWidth * layout.PORTRAIT.SIZE_FACTOR_W,
        canvasHeight * layout.PORTRAIT.SIZE_FACTOR_H
    );
}

/**
 * Récupère la position Y centrale du portrait
 * @param {number} canvasHeight
 * @param {'dialogue' | 'choice'} mode
 * @returns {number}
 */
export function getPortraitCenterY(canvasHeight, mode = 'dialogue') {
    const layout = getLayout(mode);
    return canvasHeight * layout.PORTRAIT.CENTER_Y_PERCENT;
}

/**
 * Calcule les limites de la zone de texte (mode dialogue)
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {{x: number, y: number, width: number, height: number, maxLines: number}}
 */
export function getTextBounds(canvasWidth, canvasHeight) {
    const layout = LAYOUT_DIALOGUE;
    const startY = canvasHeight * layout.TEXT.Y_PERCENT;
    const endY = canvasHeight * layout.INSTRUCTIONS.Y_PERCENT - 20;
    const maxHeight = endY - startY;
    const lineHeight = layout.TEXT.FONT_SIZE * layout.TEXT.LINE_HEIGHT;
    const maxLines = Math.floor(maxHeight / lineHeight);

    return {
        x: canvasWidth * (1 - layout.TEXT.WIDTH_PERCENT) / 2,
        y: startY,
        width: canvasWidth * layout.TEXT.WIDTH_PERCENT,
        height: maxHeight,
        maxLines: Math.min(maxLines, layout.TEXT.MAX_LINES),
        lineHeight: lineHeight,
        fontSize: layout.TEXT.FONT_SIZE
    };
}

/**
 * Récupère les positions des badges (mode choice)
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {Array<{x: number, y: number}>}
 */
export function getBadgePositions(canvasWidth, canvasHeight) {
    const layout = LAYOUT_CHOICE;
    const y = canvasHeight * layout.BADGES.Y_PERCENT;
    return [
        { x: canvasWidth * layout.BADGES.LEFT_X_PERCENT, y },
        { x: canvasWidth * layout.BADGES.RIGHT_X_PERCENT, y }
    ];
}

/**
 * Vérifie si un point est dans un badge
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {{x: number, y: number}} badgePos
 * @returns {boolean}
 */
export function isPointInBadge(px, py, badgePos) {
    const hw = LAYOUT_CHOICE.BADGES.WIDTH / 2;
    const hh = LAYOUT_CHOICE.BADGES.HEIGHT / 2;
    return px >= badgePos.x - hw && px <= badgePos.x + hw &&
           py >= badgePos.y - hh && py <= badgePos.y + hh;
}

/**
 * Helper: convertit hex en rgba
 * @param {string} hex
 * @param {number} alpha
 * @returns {string}
 */
export function hexToRgba(hex, alpha) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
    }
    return `rgba(0, 255, 255, ${alpha})`;
}
