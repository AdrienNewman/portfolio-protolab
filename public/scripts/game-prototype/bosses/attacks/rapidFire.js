// ============================================
// ATTACK: Rapid Fire
// Fires a quick burst of projectiles with delays
// ============================================

/**
 * Execute rapid fire attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {object} result - Result object to populate
 */
export function attackRapidFire(controller, attack, enemy, player, result) {
    // Queue burst shots avec burstCooldown (pas cooldown principal)
    const burstDelay = attack.burstCooldown || 100;
    for (let i = 0; i < attack.burstCount; i++) {
        setTimeout(() => {
            if (controller.activeAttacks) {
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                const spread = (Math.random() - 0.5) * 0.2;

                controller.projectiles.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.cos(angle + spread) * attack.projectileSpeed,
                    vy: Math.sin(angle + spread) * attack.projectileSpeed,
                    size: attack.projectileSize,
                    color: attack.projectileColor,
                    damage: attack.damage,
                    type: 'rapid'
                });
            }
        }, i * burstDelay);
    }
}
