// ============================================
// BOSS REGISTRY - Central Export
// All boss configs and controller
// Doc-aligned: 7 bosses (Clippy → Bill Gates)
// ============================================

// Import boss configs - 7 bosses actifs (Clippy → Bill Gates)
import { boss_clippe } from './configs/boss_clippe.js';
import { boss_explorer } from './configs/boss_explorer.js';
import { boss_messenger } from './configs/boss_messenger.js';
import { boss_update } from './configs/boss_update.js';
import { boss_norton } from './configs/boss_norton.js';
import { boss_hub } from './configs/boss_hub.js';
import { boss_gates } from './configs/boss_gates.js';

// Re-export individual configs
export {
    boss_clippe,
    boss_explorer,
    boss_messenger,
    boss_update,
    boss_norton,
    boss_hub,
    boss_gates
};

// Aggregated object - Layer mapping
export const BOSS_BEHAVIORS = {
    // Layer 7 - Application
    boss_clippe,
    // Layer 6 - Presentation
    boss_explorer,
    // Layer 5 - Session
    boss_messenger,
    // Layer 4 - Transport
    boss_update,
    // Layer 3 - Network
    boss_norton,
    // Layer 2 - Data Link
    boss_hub,
    // Layer 1 - Physical (Final Boss)
    boss_gates
};

// Layer to Boss ID mapping
export const LAYER_BOSS_MAP = {
    7: 'boss_clippe',
    6: 'boss_explorer',
    5: 'boss_messenger',
    4: 'boss_update',
    3: 'boss_norton',
    2: 'boss_hub',
    1: 'boss_gates'
};

/**
 * Get boss behavior config by ID
 * @param {string} bossId - Boss identifier
 * @returns {object|null} Boss config or null
 */
export function getBossBehavior(bossId) {
    return BOSS_BEHAVIORS[bossId] || null;
}

/**
 * Get boss for a specific OSI layer
 * @param {number} layer - OSI layer (1-7)
 * @returns {object|null} Boss config or null
 */
export function getBossForLayer(layer) {
    const bossId = LAYER_BOSS_MAP[layer];
    return bossId ? BOSS_BEHAVIORS[bossId] : null;
}

/**
 * Get all boss IDs
 * @returns {string[]} Array of boss IDs
 */
export function getAllBossIds() {
    return Object.keys(BOSS_BEHAVIORS);
}
