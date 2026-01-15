// ============================================
// POWER CONFIG: Boost GPIO
// Projectiles +35% plus rapides - signaux GPIO optimisés
// Généré automatiquement par MCP Tools
// ============================================

export const power_gpio_boost = {
  // Identité
  id: 'power_gpio_boost',
  name: 'Boost GPIO',
  sage: 'sage_rpi',
  icon: '📡',
  description: 'Projectiles +35% plus rapides - signaux GPIO optimisés',

  // Effet du pouvoir
  effect: {
    type: 'projectile_speed_boost',
    multiplier: 1.35
  },

  // Rareté
  rarity: 'common',
};
