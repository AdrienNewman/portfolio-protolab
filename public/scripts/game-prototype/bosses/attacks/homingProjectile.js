// ============================================
// ATTACK: Homing Projectile
// Fires a projectile that tracks the player
// ============================================

/**
 * Execute homing projectile attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {object} result - Result object to populate
 */
export function attackHomingProjectile(controller, attack, enemy, player, result) {
    result.projectiles.push({
        x: enemy.x,
        y: enemy.y,
        vx: 0,
        vy: attack.projectileSpeed * 0.5,
        size: attack.projectileSize,
        color: attack.projectileColor,
        damage: attack.damage,
        type: 'homing',
        homingStrength: attack.homingStrength,
        target: player
    });
}
