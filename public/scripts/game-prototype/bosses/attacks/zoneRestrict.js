// ============================================
// ATTACK: Zone Restrict
// Creates restrictive zones that damage player if entered
// Used by: boss_gates (Phase 2 - Azure Cloud)
// V4.27 - Region Lock attack
// ============================================

/**
 * Execute zone restrict attack
 * Creates multiple restricted zones that damage the player
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackZoneRestrict(controller, attack, enemy, result) {
    const zoneCount = attack.zoneCount || 3;
    const zoneRadius = attack.zoneRadius || 80;
    const zoneDuration = attack.zoneDuration || 5000;
    const zoneColor = attack.zoneColor || '#0089D6';
    const damage = attack.damage || 10;

    // Create zones at random positions avoiding edges
    const margin = zoneRadius + 40;
    const usableWidth = controller.canvasWidth - margin * 2;
    const usableHeight = controller.canvasHeight - margin * 2;

    for (let i = 0; i < zoneCount; i++) {
        // Spread zones across the screen
        const sectionWidth = usableWidth / zoneCount;
        const baseX = margin + sectionWidth * i;

        result.hazards.push({
            x: baseX + Math.random() * sectionWidth,
            y: margin + Math.random() * usableHeight,
            radius: zoneRadius,
            duration: zoneDuration,
            damagePerSecond: damage,
            type: 'zone_restrict',
            color: zoneColor,
            // Visual properties for Azure Cloud theme
            pulseSpeed: 0.003,
            glowIntensity: 0.6,
            borderWidth: 3
        });
    }
}
