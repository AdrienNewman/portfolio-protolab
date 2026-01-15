// ============================================
// ATTACK: Projectile Aimed
// Fires a single projectile with player prediction
// ============================================

/**
 * Execute aimed projectile attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {object} result - Result object to populate
 */
export function attackProjectileAimed(controller, attack, enemy, player, result) {
    // Predict player position
    const predX = player.x + (player.vx || 0) * attack.aimPrediction * 10;
    const predY = player.y + (player.vy || 0) * attack.aimPrediction * 10;

    const angle = Math.atan2(predY - enemy.y, predX - enemy.x);

    result.projectiles.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * attack.projectileSpeed,
        vy: Math.sin(angle) * attack.projectileSpeed,
        size: attack.projectileSize,
        color: attack.projectileColor,
        damage: attack.damage,
        type: 'aimed'
    });
}
