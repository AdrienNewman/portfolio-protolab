// ============================================
// POWER CONFIG: Chmod 777 (Linus Torvalds)
// Spawn un bonus invincibilité toutes les 30s - accès total !
// Généré automatiquement par MCP Tools
// ============================================

export const power_git_revert = {
  // Identité
  id: 'power_git_revert',
  name: 'Chmod 777',
  sage: 'sage_linus',
  icon: '🔓',
  description: 'Spawn un bonus invincibilité (5s) toutes les 30s - accès total !',

  // Effet du pouvoir
  effect: {
    type: 'spawn_invincibility',
    interval: 30000,
    invincibilityDuration: 5000
  },

  // Rareté
  rarity: 'legendary',
};
