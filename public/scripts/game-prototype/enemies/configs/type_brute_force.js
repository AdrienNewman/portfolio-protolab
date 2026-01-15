// ============================================
// ENEMY CONFIG: Brute Force
// Layer 5 - Session Enemy
// Password brute force attack
// ============================================

export const type_brute_force = {
    id: 'type_brute_force',
    name: 'Brute Force',
    layer: 5,

    // Stats
    health: 5,
    speed: 1.8,
    size: 48,
    points: 280,

    // Behavior
    behavior: 'slow_tank',
    behaviorParams: {
        speedMultiplier: 0.7
    },

    // Visual
    visual: 'tank',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 5
};
