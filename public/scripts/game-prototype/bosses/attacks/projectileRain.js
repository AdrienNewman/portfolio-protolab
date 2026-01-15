// ============================================
// ATTACK: Projectile Rain
// Drops projectiles from above in a spread pattern
// ============================================

/**
 * Execute projectile rain attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackProjectileRain(controller, attack, enemy, result) {
    const startX = enemy.x - attack.spreadWidth / 2;
    for (let i = 0; i < attack.dropCount; i++) {
        result.projectiles.push({
            x: startX + (attack.spreadWidth / attack.dropCount) * i + Math.random() * 20,
            y: -20,
            vx: 0,
            vy: attack.dropSpeed,
            size: attack.dropSize,
            color: attack.dropColor,
            damage: attack.damage,
            type: 'rain'
        });
    }
}
