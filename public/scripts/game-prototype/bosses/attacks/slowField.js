// ============================================
// ATTACK: Slow Field
// Boss: WINDOWS UPDATE (L4)
// Creates a zone that slows the player down
// ============================================

/**
 * Slow Field Attack
 * Creates a visible zone that slows the player's movement
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} attack - Attack config
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object
 */
export function attackSlowField(controller, attack, enemy, result) {
    const fieldRadius = attack.fieldRadius || 150;
    const slowFactor = attack.slowFactor || 0.4; // Player moves at 40% speed
    const duration = attack.duration || 4000;
    const fieldColor = attack.fieldColor || '#0078D4';
    const canvasWidth = controller.canvasWidth || 800;
    const canvasHeight = controller.canvasHeight || 600;

    // Create slow field hazard at random position in player area
    const fieldX = 100 + Math.random() * (canvasWidth - 200);
    const fieldY = canvasHeight * 0.5 + Math.random() * (canvasHeight * 0.4);

    controller.hazards.push({
        type: 'slow_field',
        x: fieldX,
        y: fieldY,
        radius: fieldRadius,
        slowFactor: slowFactor,
        duration: duration,
        color: fieldColor,
        // Visual properties
        pulsePhase: 0,
        warningText: 'TÉLÉCHARGEMENT...'
    });

    // Add download progress visual
    result.specialEffects = result.specialEffects || [];
    result.specialEffects.push({
        type: 'slow_field_spawn',
        x: fieldX,
        y: fieldY,
        radius: fieldRadius,
        color: fieldColor,
        text: 'Téléchargement en cours...'
    });

    console.log(`[Attack] Slow Field: radius=${fieldRadius}, slowFactor=${slowFactor}, duration=${duration}ms`);
}
