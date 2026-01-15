// ============================================
// ENEMY CONFIG: Port Scanner
// Layer 4 - Transport Enemy
// Network reconnaissance
// ============================================

export const type_port_scanner = {
    id: 'type_port_scanner',
    name: 'Port Scanner',
    layer: 4,

    // Stats
    health: 2,
    speed: 2.8,
    size: 32,
    points: 150,

    // Behavior
    behavior: 'diagonal',
    behaviorParams: {
        speedMultiplier: 0.8,
        bounceMargin: 50
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 10
};
