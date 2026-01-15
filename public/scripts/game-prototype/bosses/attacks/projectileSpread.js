// ============================================
// ATTACK: Projectile Spread
// Fires projectiles in a fixed downward spread
// ============================================

/**
 * Execute projectile spread attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {object} result - Result object to populate
 */
export function attackProjectileSpread(controller, attack, enemy, player, result) {
    const spreadRad = (attack.spreadAngle * Math.PI) / 180;
    const startAngle = Math.PI / 2 - spreadRad / 2;
    const angleStep = spreadRad / (attack.projectiles - 1);

    for (let i = 0; i < attack.projectiles; i++) {
        const angle = startAngle + angleStep * i;
        result.projectiles.push({
            x: enemy.x,
            y: enemy.y + enemy.size / 2,
            vx: Math.cos(angle) * attack.projectileSpeed,
            vy: Math.sin(angle) * attack.projectileSpeed,
            size: attack.projectileSize,
            color: attack.projectileColor,
            damage: attack.damage,
            type: 'spread'
        });
    }
}
