// ============================================
// ENEMY CONFIG: Ping of Death
// Layer 3 - Network Enemy
// Oversized ICMP packet attack
// ============================================

export const type_ping_death = {
    id: 'type_ping_death',
    name: 'Ping of Death',
    layer: 3,

    // Stats
    health: 4,
    speed: 1.8,
    size: 44,
    points: 200,

    // Behavior
    behavior: 'heavy',
    behaviorParams: {
        speedMultiplier: 0.8,
        waveAmplitude: 1.5
    },

    // Visual
    visual: 'tank',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 6
};
