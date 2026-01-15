// ============================================
// ATTACK: Screen Flash
// Creates a screen-wide flash effect with damage
// ============================================

/**
 * Execute screen flash attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackScreenFlash(controller, attack, enemy, result) {
    result.screenEffect = {
        type: 'flash_warning',
        chargeTime: attack.chargeTime,
        damage: attack.flashDamage,
        color: attack.warningColor
    };
}
