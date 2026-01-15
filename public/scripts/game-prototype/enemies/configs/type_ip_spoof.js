// ============================================
// ENEMY CONFIG: IP Spoofer
// Layer 3 - Network Enemy
// IP address spoofing attack
// ============================================

export const type_ip_spoof = {
    id: 'type_ip_spoof',
    name: 'IP Spoofer',
    layer: 3,

    // Stats
    health: 2,
    speed: 3.0,
    size: 34,
    points: 160,

    // Behavior
    behavior: 'phase',
    behaviorParams: {
        phaseInterval: 60
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 10
};
