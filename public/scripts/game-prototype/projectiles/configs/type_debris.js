// ============================================
// PROJECTILE CONFIG: Debris
// Irregular rotating polygon debris
// ============================================

export const type_debris = {
    id: 'type_debris',
    name: 'Debris',
    description: 'Débris polygonal irrégulier rotatif',

    // Visual
    visual: 'debris',
    hasTrail: false,
    trailLength: 0,
    hasGlow: true,

    // Default values
    defaultSize: 16,
    defaultDamage: 8,
    defaultLifetime: 8000,

    // Polygon generation
    minPoints: 5,
    maxPoints: 8,
    radiusVariation: 0.3,

    // Physics
    physics: 'standard',
    hasRotation: true,
    defaultRotationSpeed: 0.05,

    // Rendering
    renderStyle: 'polygon',
    outline: true,
    outlineAlpha: 0.3
};
