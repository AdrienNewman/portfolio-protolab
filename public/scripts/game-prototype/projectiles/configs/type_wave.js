// ============================================
// PROJECTILE CONFIG: Wave
// Concentric ring style projectile
// ============================================

export const type_wave = {
    id: 'type_wave',
    name: 'Wave Ring',
    description: 'Anneau concentrique pulsant',

    // Visual
    visual: 'wave',
    hasTrail: true,
    trailLength: 4,
    hasGlow: true,

    // Default values
    defaultSize: 20,
    defaultDamage: 10,
    defaultLifetime: 10000,

    // Ring properties
    outerStrokeWidth: 3,
    innerFillAlpha: 0.5,
    innerRadiusRatio: 0.5,

    // Rendering
    renderStyle: 'ring'
};
