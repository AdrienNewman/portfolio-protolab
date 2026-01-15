// ============================================
// ATTACK: Screen Shake Attack
// Boss: MSN MESSENGER (L5)
// The famous NUDGE effect from MSN!
// ============================================

/**
 * Screen Shake Attack - The MSN NUDGE
 * Shakes the screen violently and can stun the player
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} attack - Attack config
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object
 */
export function attackScreenShakeAttack(controller, attack, enemy, result) {
    const shakeIntensity = attack.shakeIntensity || 15;
    const shakeDuration = attack.shakeDuration || 800;
    const damage = attack.damage || 10;
    const stunDuration = attack.stunDuration || 500;
    const warningColor = attack.warningColor || '#7FBA00';

    // Create the screen shake effect
    result.screenEffect = {
        type: 'shake',
        intensity: shakeIntensity,
        duration: shakeDuration,
        color: warningColor
    };

    // Add visual indicator (nudge icon expanding)
    result.specialEffects = result.specialEffects || [];
    result.specialEffects.push({
        type: 'nudge_wave',
        x: enemy.x,
        y: enemy.y,
        radius: 0,
        maxRadius: 300,
        duration: shakeDuration,
        color: warningColor
    });

    // Apply damage if player is in range
    const damageRadius = 250;
    result.areaEffect = {
        type: 'nudge_damage',
        x: enemy.x,
        y: enemy.y,
        radius: damageRadius,
        damage: damage,
        stun: stunDuration
    };

    // Visual text
    result.attackText = {
        text: '*NUDGE* *NUDGE* *NUDGE*',
        x: enemy.x,
        y: enemy.y - 60,
        color: warningColor,
        duration: 1000
    };

    console.log(`[Attack] Screen Shake: intensity=${shakeIntensity}, duration=${shakeDuration}ms`);
}
