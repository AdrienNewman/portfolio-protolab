// ============================================
// OSI STACK HUD - Configuration
// Centralized constants for the symmetric HUD
// V1.0 - Sprint B2
// ============================================

/**
 * OSI Layer Colors - Rainbow spectrum for visual distinction
 * Updated colors for better OSI differentiation
 */
export const LAYER_COLORS = {
    7: { color: '#ff0080', glow: 'rgba(255, 0, 128, 0.5)', name: 'APPLICATION' },
    6: { color: '#ff6600', glow: 'rgba(255, 102, 0, 0.5)', name: 'PRESENTATION' },
    5: { color: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)', name: 'SESSION' },
    4: { color: '#00ffff', glow: 'rgba(0, 255, 255, 0.5)', name: 'TRANSPORT' },
    3: { color: '#0088ff', glow: 'rgba(0, 136, 255, 0.5)', name: 'NETWORK' },
    2: { color: '#aa00ff', glow: 'rgba(170, 0, 255, 0.5)', name: 'DATA LINK' },
    1: { color: '#ffff00', glow: 'rgba(255, 255, 0, 0.5)', name: 'PHYSICAL' }
};

/**
 * HP Configuration - Symmetric "Poupee Russe" model
 * L7 = CORE unique (100 HP)
 * L6-L1 = Header (50 HP) + Trailer (50 HP) each
 */
export const LAYER_HP = {
    7: { type: 'core', hp: 100 },
    6: { type: 'symmetric', header: 50, trailer: 50 },
    5: { type: 'symmetric', header: 50, trailer: 50 },
    4: { type: 'symmetric', header: 50, trailer: 50 },
    3: { type: 'symmetric', header: 50, trailer: 50 },
    2: { type: 'symmetric', header: 50, trailer: 50 },
    1: { type: 'symmetric', header: 50, trailer: 50 }
};

/**
 * HUD Positioning - Left side of screen, vertical stack
 */
export const HUD_POSITION = {
    X: 20,              // Pixels from left edge
    WIDTH: 80,          // Total width of each block
    BLOCK_HEIGHT: 25,   // Height per block (header/trailer/core)
    BLOCK_GAP: 2,       // Gap between blocks within a layer
    LAYER_GAP: 4,       // Gap between layers
    LABEL_HEIGHT: 12,   // Height for layer label
    PADDING: 10         // Padding inside background panel
};

/**
 * Animation Timings (milliseconds)
 */
export const ANIMATION_TIMING = {
    DAMAGE_FLASH_DURATION: 200,     // Flash rouge on hit
    DAMAGE_FLASH_COUNT: 3,          // Number of flashes
    DESTRUCTION_DURATION: 500,       // Explosion animation
    UNLOCK_DURATION: 800,            // Layer appearance animation
    PULSE_SPEED: 0.003,              // Global pulse speed
    CRITICAL_FLICKER_SPEED: 0.15     // Flicker speed when critical
};

/**
 * Visual States for blocks
 */
export const BLOCK_STATES = {
    LOCKED: 'locked',
    HEALTHY: 'healthy',
    DAMAGED: 'damaged',     // HP < 50%
    CRITICAL: 'critical',   // HP < 25%
    DESTROYED: 'destroyed'
};

/**
 * Layer progression mapping (which layer unlocks after which boss)
 * Boss defeated -> Layer number to unlock
 */
export const BOSS_TO_LAYER = {
    'boss_clippe': 6,      // After Clippy (L7 boss) -> unlock L6
    'boss_explorer': 5,    // After IE6 (L6 boss) -> unlock L5
    'boss_messenger': 4,   // After MSN (L5 boss) -> unlock L4
    'boss_update': 3,      // After WinUpdate (L4 boss) -> unlock L3
    'boss_norton': 2,      // After Norton (L3 boss) -> unlock L2
    'boss_hub': 1,         // After Hub (L2 boss) -> unlock L1
    'boss_gates': null     // Final boss, no unlock after
};

/**
 * Calculate total height of the HUD based on unlocked layers
 * @param {number} unlockedCount - Number of unlocked layers (1-7)
 * @returns {number} Total height in pixels
 */
export function calculateHUDHeight(unlockedCount) {
    let height = HUD_POSITION.PADDING * 2; // Top + bottom padding

    for (let i = 0; i < unlockedCount; i++) {
        const layerNum = 7 - i; // Start from L7, go down
        height += HUD_POSITION.LABEL_HEIGHT;

        if (layerNum === 7) {
            // Core only
            height += HUD_POSITION.BLOCK_HEIGHT;
        } else {
            // Header + Trailer
            height += HUD_POSITION.BLOCK_HEIGHT * 2 + HUD_POSITION.BLOCK_GAP;
        }

        if (i < unlockedCount - 1) {
            height += HUD_POSITION.LAYER_GAP;
        }
    }

    return height;
}
