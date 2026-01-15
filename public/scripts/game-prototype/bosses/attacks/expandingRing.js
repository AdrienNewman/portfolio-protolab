// ============================================
// ATTACK: Expanding Ring
// Creates expanding circular rings of damage
// ============================================

/**
 * Execute expanding ring attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackExpandingRing(controller, attack, enemy, result) {
    for (let i = 0; i < attack.rings; i++) {
        setTimeout(() => {
            controller.activeAttacks.push({
                type: 'ring',
                x: enemy.x,
                y: enemy.y,
                radius: 0,
                speed: attack.ringSpeed,
                width: attack.ringWidth,
                damage: attack.damage,
                color: attack.ringColor,
                maxRadius: controller.canvasWidth,
                active: true
            });
        }, i * attack.ringDelay);
    }
}
