// ============================================
// ATTACK: Spawn Minions
// Spawns additional enemy units
// ============================================

/**
 * Execute spawn minions attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackSpawnMinions(controller, attack, enemy, result) {
    result.spawnMinions = {
        type: attack.minionType,
        count: attack.minionCount,
        pattern: attack.spawnPattern
    };
}
