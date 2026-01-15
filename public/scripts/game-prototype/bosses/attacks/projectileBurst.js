// ============================================
// ATTACK: Projectile Burst
// Fires projectiles in a spread pattern toward player
// ============================================

/**
 * Execute projectile burst attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {object} result - Result object to populate
 */
export function attackProjectileBurst(controller, attack, enemy, player, result) {
    const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    const spreadRad = (attack.spreadAngle * Math.PI) / 180;
    const startAngle = angleToPlayer - spreadRad / 2;
    const angleStep = spreadRad / (attack.projectiles - 1);

    for (let i = 0; i < attack.projectiles; i++) {
        const angle = startAngle + angleStep * i;
        const projectile = {
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * attack.projectileSpeed,
            vy: Math.sin(angle) * attack.projectileSpeed,
            size: attack.projectileSize,
            color: attack.projectileColor,
            damage: attack.damage,
            type: 'burst'
        };
        // Support pour les types de projectiles custom (ex: 'letter' pour CLIPP-E)
        if (attack.projectileType) {
            projectile.projectileType = attack.projectileType;
        }
        result.projectiles.push(projectile);
    }
}
