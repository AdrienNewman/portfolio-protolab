// ============================================
// ATTACK: Projectile Redirect
// Boss: BILL GATES - AZURE CLOUD (L1 Phase 2)
// Projectiles that change direction mid-flight
// Simulates BGP hijacking (route redirection)
// ============================================

/**
 * Projectile Redirect Attack
 * Fires projectiles that change direction after a delay
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} attack - Attack config
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {object} result - Result object
 */
export function attackProjectileRedirect(controller, attack, enemy, player, result) {
    const projectileCount = attack.projectiles || 6;
    const redirectDelay = attack.redirectDelay || 800; // ms before redirect
    const redirectAngle = attack.redirectAngle || 90; // degrees to turn
    const projectileSpeed = attack.projectileSpeed || 3;
    const projectileSize = attack.projectileSize || 15;
    const projectileColor = attack.projectileColor || '#50E6FF';
    const damage = attack.damage || 14;

    // Spawn projectiles in a spread pattern
    const spreadAngle = Math.PI * 0.8; // ~145 degrees spread
    const startAngle = Math.PI / 2 - spreadAngle / 2; // Pointing down

    for (let i = 0; i < projectileCount; i++) {
        const angle = startAngle + (spreadAngle / (projectileCount - 1)) * i;

        controller.projectiles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * projectileSpeed,
            vy: Math.sin(angle) * projectileSpeed,
            size: projectileSize,
            color: projectileColor,
            damage: damage,
            type: 'redirect',
            // Redirect properties
            redirectTimer: redirectDelay,
            redirectAngle: (redirectAngle * Math.PI / 180) * (i % 2 === 0 ? 1 : -1), // Alternate direction
            hasRedirected: false,
            baseSpeed: projectileSpeed,
            // Target for smart redirect
            targetPlayer: player,
            // Visual
            shape: 'cloud_packet',
            glowColor: '#0089D6',
            rotation: angle,
            rotationSpeed: 0.05,
            trail: true,
            trailColor: '#50E6FF'
        });
    }

    // Visual effect
    result.attackText = {
        text: 'BGP HIJACK!',
        x: enemy.x,
        y: enemy.y - 70,
        color: '#50E6FF',
        duration: 1000
    };

    console.log(`[Attack] Projectile Redirect: count=${projectileCount}, redirectDelay=${redirectDelay}ms`);
}

/**
 * Helper: Process redirect projectiles in controller update
 */
export function processRedirectProjectiles(controller, deltaTime, player) {
    for (const p of controller.projectiles) {
        if (p.type === 'redirect' && !p.hasRedirected) {
            p.redirectTimer -= deltaTime;

            if (p.redirectTimer <= 0) {
                p.hasRedirected = true;

                // Calculate new direction (redirect toward player)
                const dx = player.x - p.x;
                const dy = player.y - p.y;
                const angleToPlayer = Math.atan2(dy, dx);

                // Apply redirect with some randomness
                const newAngle = angleToPlayer + (Math.random() - 0.5) * 0.5;

                p.vx = Math.cos(newAngle) * p.baseSpeed * 1.5; // Speed boost on redirect
                p.vy = Math.sin(newAngle) * p.baseSpeed * 1.5;
                p.rotation = newAngle;

                // Visual flash on redirect
                p.redirectFlash = true;
            }
        }
    }
}
