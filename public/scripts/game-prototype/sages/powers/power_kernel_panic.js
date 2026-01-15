// ============================================
// POWER CONFIG: Kernel Panic
// Invincibilité 1s après dégâts - le kernel se protège
// Généré automatiquement par MCP Tools
// ============================================

export const power_kernel_panic = {
  // Identité
  id: 'power_kernel_panic',
  name: 'Kernel Panic',
  sage: 'sage_tux',
  icon: '🐧',
  description: 'Invincibilité 1s après dégâts - le kernel se protège',

  // Effet du pouvoir
  effect: {
    type: 'invincibility_on_hit',
    duration: 1000
  },

  // Rareté
  rarity: 'uncommon',
};
