// ============================================
// TRANSITION CONFIG - Centralized Settings
// Timings, layout, styles pour LayerTransitionScreen
// V1.0 - LayerTransitionScreen Refactoring
// ============================================

/**
 * Configuration centralisée pour LayerTransitionScreen
 * Éditer ce fichier pour ajuster l'expérience utilisateur
 */
export const TRANSITION_CONFIG = {
    // ============================================
    // PHASE A: REINFORCEMENT (Sage + Power Choice)
    // ============================================
    phaseA: {
        // Timings (ms)
        fadeInDuration: 800,        // Fondu d'entrée
        portraitAppearDuration: 600, // Animation portrait (scale)
        dialogueCharDelay: 30,       // Délai entre chaque caractère (typewriter)
        badgeAppearDelay: 150,       // Délai avant apparition badges
        badgeAppearDuration: 400,    // Durée animation apparition badge
        selectionFlashDuration: 600, // Flash de sélection pouvoir
        fadeOutDuration: 500,        // Fondu vers Phase B

        // Comportement
        allowSkipDialogue: true,     // Permettre skip dialogue avec ENTER
        autoAdvanceAfterSelection: true // Passer automatiquement après choix pouvoir
    },

    // ============================================
    // PHASE B: OSI TRANSITION (Packet Animation)
    // ============================================
    phaseB: {
        // Timings (ms)
        autoSkipDelay: 10000,        // Auto-skip après 10 secondes
        packetAnimDuration: 6000,    // Durée animation paquet
        wipeDuration: 1500,          // Durée iris wipe
        narrativeLineDelay: 600,     // Délai entre lignes narratives

        // Synchronisation addLayer() - CRITIQUE
        layerUnlockTrigger: 0.7,     // À 70% de l'animation paquet = appel addLayer()

        // Comportement
        allowManualSkip: true,       // Permettre skip avec ENTER
        showSkipHint: true,          // Afficher "Press ENTER to skip"
        skipHintDelay: 2000          // Délai avant affichage du hint
    },

    // ============================================
    // PHASE C: NEXT LAYER INTRO
    // ============================================
    phaseC: {
        // Timings (ms)
        fadeInDuration: 600,         // Fondu d'entrée
        dialogueFadeIn: 400,         // Fondu texte
        minDisplayTime: 2000,        // Temps minimum d'affichage
        fadeOutDuration: 500,        // Fondu de sortie

        // Comportement
        allowSkip: true,             // Permettre skip avec ENTER
        showContinueHint: true       // Afficher "Press ENTER to continue"
    },

    // ============================================
    // DIALOGUE BUBBLE (JRPG Style)
    // ============================================
    dialogueBubble: {
        // Dimensions
        padding: 20,                 // Padding interne
        maxWidthPercent: 0.75,       // 75% de la largeur canvas
        minHeight: 80,               // Hauteur minimum
        borderRadius: 8,             // Arrondi des coins

        // Couleurs
        bgColor: 'rgba(10, 10, 20, 0.92)',
        borderColor: '#00ffff',      // Couleur par défaut (overridé par sage.accentColor)
        borderWidth: 3,
        glowIntensity: 15,           // Intensité shadowBlur

        // Typographie
        fontSize: 18,
        fontFamily: '"Space Mono", "Courier New", monospace',
        lineHeight: 26,
        textColor: '#ffffff',

        // Curseur typewriter
        cursorBlinkRate: 400,        // ms
        cursorChar: '█'
    },

    // ============================================
    // LAYOUT (Positions relatives au canvas)
    // ============================================
    layout: {
        // Portrait sage
        portrait: {
            yPercent: 0.25,          // 25% depuis le haut
            size: 120,               // Taille en pixels
            glowRadius: 20           // Rayon du glow
        },

        // Bulle dialogue
        dialogue: {
            yPercent: 0.82,          // 82% depuis le haut (plus bas pour portrait grand)
            xPercent: 0.5            // Centré horizontalement
        },

        // Badges pouvoirs
        badges: {
            yPercent: 0.48,          // 48% depuis le haut
            gap: 200,                // Écart entre les 2 badges
            size: 90,                // Taille badge
            hoverRadius: 70          // Rayon de détection hover
        },

        // Animation OSI (Phase B)
        osiPanel: {
            layerBoxWidth: 400,
            layerBoxHeight: 100,
            completedLayerY: 150,    // Position Y layer complétée
            nextLayerY: 450,         // Position Y layer suivante
            packetSize: 32           // Taille du paquet animé
        }
    },

    // ============================================
    // PARTICLES & EFFECTS
    // ============================================
    particles: {
        // Étoiles fond (Phase B)
        stars: {
            count: 100,
            minSize: 1,
            maxSize: 3,
            minAlpha: 0.2,
            maxAlpha: 0.8
        },

        // Particules ambiantes (Phase A/C)
        ambient: {
            count: 30,
            speed: 0.5,
            size: 2
        }
    },

    // ============================================
    // AUDIO CUES
    // ============================================
    audio: {
        phaseAStart: 'sage_appear',
        powerSelect: 'powerup',
        phaseBStart: 'transition_whoosh',
        layerUnlock: 'layer_unlock',
        phaseCStart: 'sage_intro',
        complete: 'transition_complete'
    },

    // ============================================
    // DEBUG
    // ============================================
    debug: {
        showPhaseTimer: false,       // Afficher timer de phase
        showPacketProgress: false,   // Afficher progression paquet
        skipPhaseB: false,           // Skip Phase B (dev only)
        logStateChanges: true        // Log les changements d'état
    }
};

// ============================================
// COMPUTED VALUES (Helpers)
// ============================================

/**
 * Calcule la position X centrée pour les badges
 * @param {number} canvasWidth - Largeur du canvas
 * @param {number} index - Index du badge (0 ou 1)
 * @returns {number} - Position X
 */
export function getBadgeX(canvasWidth, index) {
    const centerX = canvasWidth / 2;
    const gap = TRANSITION_CONFIG.layout.badges.gap;
    return index === 0 ? centerX - gap / 2 : centerX + gap / 2;
}

/**
 * Calcule la position Y d'un élément basé sur pourcentage
 * @param {number} canvasHeight - Hauteur du canvas
 * @param {string} element - Nom de l'élément (portrait, dialogue, badges)
 * @returns {number} - Position Y
 */
export function getElementY(canvasHeight, element) {
    const layoutConfig = TRANSITION_CONFIG.layout[element];
    if (layoutConfig && layoutConfig.yPercent !== undefined) {
        return canvasHeight * layoutConfig.yPercent;
    }
    return canvasHeight / 2;
}

/**
 * Vérifie si un point est dans un badge
 * @param {number} px - Position X du point
 * @param {number} py - Position Y du point
 * @param {number} badgeX - Centre X du badge
 * @param {number} badgeY - Centre Y du badge
 * @returns {boolean}
 */
export function isPointInBadge(px, py, badgeX, badgeY) {
    const radius = TRANSITION_CONFIG.layout.badges.hoverRadius;
    const dx = px - badgeX;
    const dy = py - badgeY;
    return (dx * dx + dy * dy) <= (radius * radius);
}
