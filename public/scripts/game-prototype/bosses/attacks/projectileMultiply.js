// ============================================
// ATTACK: Projectile Multiply
// Boss: HUB 10BASE-T (L2)
// Projectiles that split into multiple after traveling
// ============================================

/**
 * Projectile Multiply Attack
 * Fires projectiles that split into 2 after a certain distance
 * Simulates network collision/CSMA-CD behavior
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} attack - Attack config
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {object} result - Result object
 */
export function attackProjectileMultiply(controller, attack, enemy, player, result) {
    const initialCount = attack.initialProjectiles || 4;
    const multiplyAfter = attack.multiplyAfter || 150; // pixels traveled
    const maxSplits = attack.maxSplits || 2;
    const damage = attack.damage || 10;
    const projectileSpeed = attack.projectileSpeed || 4;
    const projectileSize = attack.projectileSize || 12;
    const projectileColor = attack.projectileColor || '#FF6600';

    // Spawn initial projectiles toward player
    const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    const spreadAngle = Math.PI / 4; // 45 degrees spread

    for (let i = 0; i < initialCount; i++) {
        const angle = angleToPlayer - spreadAngle / 2 + (spreadAngle / (initialCount - 1)) * i;

        controller.projectiles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * projectileSpeed,
            vy: Math.sin(angle) * projectileSpeed,
            size: projectileSize,
            color: projectileColor,
            damage: damage,
            type: 'multiply',
            // Multiply properties
            distanceTraveled: 0,
            multiplyAfter: multiplyAfter,
            splitsRemaining: maxSplits,
            baseSpeed: projectileSpeed,
            // Visual
            shape: 'collision',
            glowColor: '#FFFFFF',
            rotation: 0,
            rotationSpeed: 0.1
        });
    }

    // Schedule multiply checks
    if (!controller.multiplyCheckActive) {
        controller.multiplyCheckActive = true;
        controller.multiplyProjectiles = [];
    }

    console.log(`[Attack] Projectile Multiply: initial=${initialCount}, multiplyAfter=${multiplyAfter}px`);
}

/**
 * Helper: Process multiply projectiles in controller update
 * Call this from BossBehaviorController.updateProjectiles
 */
export function processMultiplyProjectiles(controller) {
    const newProjectiles = [];

    for (let i = controller.projectiles.length - 1; i >= 0; i--) {
        const p = controller.projectiles[i];

        if (p.type === 'multiply' && p.splitsRemaining > 0) {
            // Track distance
            p.distanceTraveled += Math.sqrt(p.vx * p.vx + p.vy * p.vy);

            // Check if should split
            if (p.distanceTraveled >= p.multiplyAfter) {
                // Create 2 new projectiles at 30 degree angles
                const currentAngle = Math.atan2(p.vy, p.vx);
                const splitAngle = Math.PI / 6; // 30 degrees

                for (let j = 0; j < 2; j++) {
                    const newAngle = currentAngle + (j === 0 ? -splitAngle : splitAngle);
                    newProjectiles.push({
                        x: p.x,
                        y: p.y,
                        vx: Math.cos(newAngle) * p.baseSpeed,
                        vy: Math.sin(newAngle) * p.baseSpeed,
                        size: p.size * 0.8,
                        color: p.color,
                        damage: p.damage * 0.7,
                        type: 'multiply',
                        distanceTraveled: 0,
                        multiplyAfter: p.multiplyAfter,
                        splitsRemaining: p.splitsRemaining - 1,
                        baseSpeed: p.baseSpeed,
                        shape: 'collision',
                        glowColor: p.glowColor,
                        rotation: 0,
                        rotationSpeed: 0.1
                    });
                }

                // Remove original
                controller.projectiles.splice(i, 1);
            }
        }
    }

    // Add new split projectiles
    controller.projectiles.push(...newProjectiles);
}
