// ============================================
// POWER CONFIG: Overclocking
// Aura de dégâts - le CPU chauffe les ennemis proches
// Généré automatiquement par MCP Tools
// ============================================

export const power_overclock = {
  // Identité
  id: 'power_overclock',
  name: 'Overclocking',
  sage: 'sage_rpi',
  icon: '🔥',
  description: 'Aura de dégâts - le CPU chauffe les ennemis proches',

  // Effet du pouvoir
  effect: {
    type: 'damage_aura',
    radius: 50,
    damagePerSecond: 3
  },

  // Rareté
  rarity: 'rare',
};
