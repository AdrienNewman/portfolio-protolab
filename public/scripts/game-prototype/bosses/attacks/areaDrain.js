// ============================================
// ATTACK: Area Drain
// Creates an expanding damage zone around the boss
// ============================================

/**
 * Execute area drain attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackAreaDrain(controller, attack, enemy, result) {
    result.hazards.push({
        x: enemy.x,
        y: enemy.y,
        radius: 0,
        maxRadius: attack.radius,
        duration: attack.duration,
        damagePerTick: attack.damagePerTick,
        tickInterval: attack.tickInterval,
        lastTick: 0,
        type: 'drain',
        color: enemy.color
    });
}
