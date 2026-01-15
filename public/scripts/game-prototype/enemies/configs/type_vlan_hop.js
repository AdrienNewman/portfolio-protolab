// ============================================
// ENEMY CONFIG: VLAN Hopper
// Layer 2 - Data Link Enemy
// VLAN hopping attack
// ============================================

export const type_vlan_hop = {
    id: 'type_vlan_hop',
    name: 'VLAN Hopper',
    layer: 2,

    // Stats
    health: 3,
    speed: 2.5,
    size: 38,
    points: 240,

    // Behavior
    behavior: 'zigzag',
    behaviorParams: {
        amplitude: 3,
        frequency: 3
    },

    // Visual
    visual: 'standard',
    color: null,
    glowColor: null,

    // Spawn weight
    spawnWeight: 8
};
