// ============================================
// PROJECTILE CONFIG: Burst
// Elongated bullet shape (burst, spread, aimed)
// ============================================

export const type_burst = {
    id: 'type_burst',
    name: 'Burst',
    description: 'Projectile allongé style balle',

    // Visual
    visual: 'bullet',
    hasTrail: true,
    trailLength: 4,
    hasGlow: true,

    // Default values
    defaultSize: 12,
    defaultDamage: 10,
    defaultLifetime: 10000,

    // Rendering
    renderStyle: 'ellipse',
    widthRatio: 0.33,
    heightRatio: 0.5,
    brightTip: true,
    tipAlpha: 0.7
};
