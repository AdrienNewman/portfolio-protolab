// ============================================
// ENEMY CONFIG: ARP Spoofer
// Layer 2 - Data Link Enemy
// ARP cache poisoning
// ============================================

export const type_arp_spoof = {
    id: 'type_arp_spoof',
    name: 'ARP Spoofer',
    layer: 2,

    // Stats
    health: 3,
    speed: 3.2,
    size: 36,
    points: 180,

    // Behavior
    behavior: 'erratic',
    behaviorParams: {
        randomness: 8,
        bounceMargin: 50
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 9
};
