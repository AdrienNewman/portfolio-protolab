// ============================================
// ENEMY CONFIG: XSS Spider
// Layer 7 - Application Enemy
// Cross-Site Scripting attack
// ============================================

export const type_xss = {
    id: 'type_xss',
    name: 'XSS Spider',
    layer: 7,

    // Stats
    health: 1,
    speed: 3.0,
    size: 28,
    points: 80,

    // Behavior
    behavior: 'fast',
    behaviorParams: {
        speedMultiplier: 1.2
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 12
};
