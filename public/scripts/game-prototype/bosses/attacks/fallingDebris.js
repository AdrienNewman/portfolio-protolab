// ============================================
// ATTACK: Falling Debris
// Drops rotating debris from above
// ============================================

/**
 * Execute falling debris attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackFallingDebris(controller, attack, enemy, result) {
    for (let i = 0; i < attack.debrisCount; i++) {
        result.projectiles.push({
            x: enemy.x - attack.spreadWidth / 2 + Math.random() * attack.spreadWidth,
            y: -50 - Math.random() * 100,
            vx: (Math.random() - 0.5) * 2,
            vy: attack.debrisSpeed + Math.random(),
            size: attack.debrisSize,
            color: enemy.color,
            damage: attack.damage,
            type: 'debris',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    }
}
