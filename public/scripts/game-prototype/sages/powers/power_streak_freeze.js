// ============================================
// POWER CONFIG: Asile Numérique (Snowden)
// Téléportation d'urgence quand HP < 20% - comme l'exil de Snowden
// Généré automatiquement par MCP Tools
// ============================================

export const power_streak_freeze = {
  // Identité
  id: 'power_streak_freeze',
  name: 'Asile Numérique',
  sage: 'sage_duo',
  icon: '🛫',
  description: 'Téléportation d\'urgence quand HP < 20% - comme l\'exil de Snowden',

  // Effet du pouvoir
  effect: {
    type: 'emergency_teleport',
    healthThreshold: 0.2,
    cooldown: 45000,
    invincibilityDuration: 2000
  },

  // Rareté
  rarity: 'rare',
};
