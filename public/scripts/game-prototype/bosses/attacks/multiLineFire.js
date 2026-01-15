// ============================================
// ATTACK: Multi-Line Fire
// Boss: HUB 10BASE-T (L2)
// Fires from multiple "ports" simultaneously
// ============================================

/**
 * Multi-Line Fire Attack
 * Fires projectiles from multiple points (like hub ports)
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} attack - Attack config
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object
 */
export function attackMultiLineFire(controller, attack, enemy, result) {
    const lineCount = attack.lines || 8;
    const projectileSpeed = attack.projectileSpeed || 5;
    const projectileSize = attack.projectileSize || 8;
    const projectileColor = attack.projectileColor || '#FF6600';
    const damage = attack.damage || 6;
    const burstCount = attack.burstCount || 3;
    const burstDelay = attack.burstDelay || 150;

    // Calculate port positions around the hub
    const hubRadius = enemy.size * 0.6;
    const angleStep = (Math.PI * 2) / lineCount;

    // Fire from each "port"
    for (let line = 0; line < lineCount; line++) {
        const portAngle = angleStep * line;

        // Position of this port
        const portX = enemy.x + Math.cos(portAngle) * hubRadius;
        const portY = enemy.y + Math.sin(portAngle) * hubRadius;

        // Fire direction (outward from port)
        const fireAngle = portAngle;

        // Create burst of projectiles from this port
        for (let burst = 0; burst < burstCount; burst++) {
            // Delay each burst slightly
            const delay = burst * burstDelay;

            // Use setTimeout-style by adding to queue (or immediate for first)
            if (burst === 0) {
                controller.projectiles.push({
                    x: portX,
                    y: portY,
                    vx: Math.cos(fireAngle) * projectileSpeed,
                    vy: Math.sin(fireAngle) * projectileSpeed,
                    size: projectileSize,
                    color: projectileColor,
                    damage: damage,
                    type: 'port_fire',
                    portIndex: line,
                    shape: 'packet',
                    glowColor: '#FFAA00',
                    rotation: fireAngle,
                    rotationSpeed: 0
                });
            } else {
                // Schedule delayed projectiles
                if (!controller.delayedProjectiles) {
                    controller.delayedProjectiles = [];
                }
                controller.delayedProjectiles.push({
                    delay: delay,
                    projectile: {
                        x: portX,
                        y: portY,
                        vx: Math.cos(fireAngle) * projectileSpeed,
                        vy: Math.sin(fireAngle) * projectileSpeed,
                        size: projectileSize,
                        color: projectileColor,
                        damage: damage,
                        type: 'port_fire',
                        portIndex: line,
                        shape: 'packet',
                        glowColor: '#FFAA00',
                        rotation: fireAngle,
                        rotationSpeed: 0
                    }
                });
            }
        }
    }

    // Visual - show all ports firing
    result.specialEffects = result.specialEffects || [];
    result.specialEffects.push({
        type: 'multi_port_fire',
        x: enemy.x,
        y: enemy.y,
        portCount: lineCount,
        radius: hubRadius,
        color: projectileColor,
        duration: 500
    });

    console.log(`[Attack] Multi-Line Fire: lines=${lineCount}, burstCount=${burstCount}`);
}
