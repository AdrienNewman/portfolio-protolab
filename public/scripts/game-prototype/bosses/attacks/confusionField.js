// ============================================
// ATTACK: Confusion Field
// Creates a screen effect that reverses/confuses player
// ============================================

/**
 * Execute confusion field attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackConfusionField(controller, attack, enemy, result) {
    result.screenEffect = {
        type: attack.effectType,
        duration: attack.duration
    };
}
