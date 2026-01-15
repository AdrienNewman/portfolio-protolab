// ============================================
// POWER CONFIG: Mode Fantôme
// Hitbox réduite de 30% - tu es invisible
// Généré automatiquement par MCP Tools
// ============================================

export const power_ghost_mode = {
  // Identité
  id: 'power_ghost_mode',
  name: 'Mode Fantôme',
  sage: 'sage_anonymous',
  icon: '👻',
  description: 'Hitbox réduite de 30% - tu es invisible',

  // Effet du pouvoir
  effect: {
    type: 'hitbox_reduction',
    multiplier: 0.7
  },

  // Rareté
  rarity: 'rare',
};
