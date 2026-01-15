// ============================================
// ENEMY CONFIG: Token Thief
// Layer 5 - Session Enemy
// JWT/OAuth token stealer
// ============================================

export const type_token_thief = {
    id: 'type_token_thief',
    name: 'Token Thief',
    layer: 5,

    // Stats
    health: 1,
    speed: 3.5,
    size: 28,
    points: 110,

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
