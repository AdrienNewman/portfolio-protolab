// ============================================
// ATTACK: Scan Beam
// Boss: NORTON ANTIVIRUS (L3)
// Vertical beam that sweeps horizontally across the screen
// ============================================

/**
 * Scan Beam Attack
 * A vertical scanning beam that sweeps across the screen
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} attack - Attack config
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object
 */
export function attackScanBeam(controller, attack, enemy, result) {
    const beamWidth = attack.beamWidth || 50;
    const sweepSpeed = attack.sweepSpeed || 3;
    const damage = attack.damage || 12;
    const warningTime = attack.warningTime || 500;
    const beamColor = attack.beamColor || '#FFD700';
    const canvasWidth = controller.canvasWidth || 800;
    const canvasHeight = controller.canvasHeight || 600;

    // Determine sweep direction (alternate)
    const sweepLeft = controller.lastScanDirection !== 'left';
    controller.lastScanDirection = sweepLeft ? 'left' : 'right';

    const startX = sweepLeft ? canvasWidth + beamWidth : -beamWidth;
    const endX = sweepLeft ? -beamWidth : canvasWidth + beamWidth;

    // Create the scanning beam as an active attack
    controller.activeAttacks.push({
        type: 'scan_beam',
        active: true,
        x: startX,
        y: 0,
        width: beamWidth,
        height: canvasHeight,
        targetX: endX,
        speed: sweepSpeed * (sweepLeft ? -1 : 1),
        damage: damage,
        color: beamColor,
        warningTimer: warningTime,
        isWarning: true,
        sweepDirection: sweepLeft ? 'left' : 'right',
        // Visual text
        scanText: 'ANALYSE EN COURS...',
        progress: 0
    });

    // Add warning visual
    result.specialEffects = result.specialEffects || [];
    result.specialEffects.push({
        type: 'scan_warning',
        x: startX,
        y: canvasHeight / 2,
        direction: sweepLeft ? 'left' : 'right',
        color: '#FF0000',
        text: '⚠️ SCAN IMMINENT',
        duration: warningTime
    });

    console.log(`[Attack] Scan Beam: width=${beamWidth}, direction=${sweepLeft ? 'left' : 'right'}`);
}
