// ============================================
// ENEMY CONFIG: MAC Flooder
// Layer 2 - Data Link Enemy
// CAM table overflow attack
// ============================================

export const type_mac_flood = {
    id: 'type_mac_flood',
    name: 'MAC Flooder',
    layer: 2,

    // Stats
    health: 1,
    speed: 4.5,
    size: 22,
    points: 120,

    // Behavior
    behavior: 'swarm',
    behaviorParams: {
        waveAmplitude: 2,
        waveFrequency: 5
    },

    // Visual
    visual: 'swarm',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 15
};
