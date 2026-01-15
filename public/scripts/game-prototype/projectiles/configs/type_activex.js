// ============================================
// PROJECTILE CONFIG: ActiveX
// Dangerous ActiveX component hexagon
// Used by boss_explorer
// ============================================

export const type_activex = {
    id: 'type_activex',
    name: 'ActiveX Component',
    description: 'Composant ActiveX obsolète et dangereux',

    // Visual
    visual: 'activex',
    hasTrail: false,
    trailLength: 0,
    hasGlow: false,

    // Hexagon colors
    fillColor: '#1E90FF',
    textColor: '#FFFFFF',
    borderColor: '#FF4444',
    labelText: 'AX',

    // Default values
    defaultSize: 20,
    defaultDamage: 15,
    defaultLifetime: 10000,

    // Rendering
    renderStyle: 'hexagon',
    sides: 6,
    fontSizeRatio: 0.35
};
