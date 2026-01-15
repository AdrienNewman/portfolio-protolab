// ============================================
// POWER CONFIG: Sudo Kill
// 5% de chance de kill instantané - sudo rm -rf enemy
// Généré automatiquement par MCP Tools
// ============================================

export const power_sudo_kill = {
  // Identité
  id: 'power_sudo_kill',
  name: 'Sudo Kill',
  sage: 'sage_tux',
  icon: '💀',
  description: '5% de chance de kill instantané - sudo rm -rf enemy',

  // Effet du pouvoir
  effect: {
    type: 'instant_kill_chance',
    chance: 0.05
  },

  // Rareté
  rarity: 'legendary',
};
