// ============================================
// ATTACK: Ground Hazard
// Creates damage zones on the ground
// ============================================

/**
 * Execute ground hazard attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackGroundHazard(controller, attack, enemy, result) {
    for (let i = 0; i < attack.hazardCount; i++) {
        result.hazards.push({
            x: 80 + Math.random() * (controller.canvasWidth - 160),
            y: controller.canvasHeight - 60,
            radius: attack.hazardRadius,
            duration: attack.hazardDuration,
            damagePerSecond: attack.damagePerSecond,
            type: 'ground',
            color: attack.hazardColor
        });
    }
}
