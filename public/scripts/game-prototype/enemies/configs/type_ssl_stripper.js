// ============================================
// ENEMY CONFIG: SSL Stripper
// Layer 6 - Presentation Enemy
// Man-in-the-middle SSL downgrade
// ============================================

export const type_ssl_stripper = {
    id: 'type_ssl_stripper',
    name: 'SSL Stripper',
    layer: 6,

    // Stats
    health: 2,
    speed: 2.2,
    size: 32,
    points: 120,

    // Behavior
    behavior: 'phase',
    behaviorParams: {
        phaseInterval: 60  // frames between phase toggles
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 10
};
