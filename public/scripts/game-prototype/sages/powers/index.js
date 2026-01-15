// ============================================
// POWER REGISTRY - Export centralisé
// Généré automatiquement par MCP Tools
// ============================================

import { power_ddos_mode } from './power_ddos_mode.js';
import { power_edit_shield } from './power_edit_shield.js';
import { power_ghost_mode } from './power_ghost_mode.js';
import { power_git_revert } from './power_git_revert.js';
import { power_gpio_boost } from './power_gpio_boost.js';
import { power_kernel_panic } from './power_kernel_panic.js';
import { power_merge_master } from './power_merge_master.js';
import { power_multi_tab } from './power_multi_tab.js';
import { power_overclock } from './power_overclock.js';
import { power_streak_freeze } from './power_streak_freeze.js';
import { power_sudo_kill } from './power_sudo_kill.js';
import { power_swift_tab } from './power_swift_tab.js';
import { power_wiki_boost } from './power_wiki_boost.js';
import { power_xp_burst } from './power_xp_burst.js';

// Re-exports individuels
export { power_ddos_mode, power_edit_shield, power_ghost_mode, power_git_revert, power_gpio_boost, power_kernel_panic, power_merge_master, power_multi_tab, power_overclock, power_streak_freeze, power_sudo_kill, power_swift_tab, power_wiki_boost, power_xp_burst };

// Registry central
export const POWERS = {
  power_ddos_mode,
  power_edit_shield,
  power_ghost_mode,
  power_git_revert,
  power_gpio_boost,
  power_kernel_panic,
  power_merge_master,
  power_multi_tab,
  power_overclock,
  power_streak_freeze,
  power_sudo_kill,
  power_swift_tab,
  power_wiki_boost,
  power_xp_burst,
};

/**
 * Récupère la config d'un pouvoir par son ID
 */
export function getPowerConfig(powerId) {
  const normalizedId = powerId.startsWith('power_') ? powerId : `power_${powerId}`;
  return POWERS[normalizedId] || null;
}

/**
 * Liste tous les IDs de pouvoirs
 */
export function getAllPowerIds() {
  return Object.keys(POWERS);
}

/**
 * Récupère les pouvoirs d'un sage
 */
export function getPowersForSage(sageId) {
  const normalizedId = sageId.startsWith('sage_') ? sageId : `sage_${sageId}`;
  return Object.values(POWERS).filter(power => power.sage === normalizedId);
}

/**
 * Récupère les pouvoirs par rareté
 */
export function getPowersByRarity(rarity) {
  return Object.values(POWERS).filter(power => power.rarity === rarity);
}
