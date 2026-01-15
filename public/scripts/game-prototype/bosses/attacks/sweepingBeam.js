// ============================================
// ATTACK: Sweeping Beam
// Creates a rotating laser beam
// ============================================

/**
 * Execute sweeping beam attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackSweepingBeam(controller, attack, enemy, result) {
    controller.activeAttacks.push({
        type: 'beam',
        x: enemy.x,
        y: enemy.y,
        length: attack.beamLength,
        width: attack.beamWidth,
        angle: -Math.PI / 2 - (attack.sweepAngle * Math.PI / 180) / 2,
        targetAngle: -Math.PI / 2 + (attack.sweepAngle * Math.PI / 180) / 2,
        sweepSpeed: attack.sweepSpeed,
        damage: attack.damage,
        color: attack.beamColor,
        active: true
    });
}
