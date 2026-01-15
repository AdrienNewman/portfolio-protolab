// ============================================
// ENEMY CONFIG: Ransomware
// Layer 6 - Presentation Enemy
// Heavy tank, slow but dangerous
// ============================================

export const type_ransomware = {
    id: 'type_ransomware',
    name: 'Ransomware',
    layer: 6,

    // Stats
    health: 4,
    speed: 1.5,
    size: 45,
    points: 200,

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
    spawnWeight: 6
};
