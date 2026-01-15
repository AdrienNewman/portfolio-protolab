// ============================================
// ATTACK: Subscription Drain
// Boss: BILL GATES - AZURE CLOUD (L1 Phase 2)
// Cloud zone that continuously drains HP
// Simulates cloud subscription costs
// ============================================

/**
 * Subscription Drain Attack
 * Creates a cloud zone that drains player HP over time
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} attack - Attack config
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object
 */
export function attackSubscriptionDrain(controller, attack, enemy, result) {
    const drainRadius = attack.drainRadius || 200;
    const drainPerSecond = attack.drainPerSecond || 8;
    const duration = attack.duration || 3000;
    const drainColor = attack.drainColor || '#FF4444';
    const canvasWidth = controller.canvasWidth || 800;
    const canvasHeight = controller.canvasHeight || 600;

    // Position the drain zone in player area
    const zoneX = canvasWidth * 0.3 + Math.random() * (canvasWidth * 0.4);
    const zoneY = canvasHeight * 0.5 + Math.random() * (canvasHeight * 0.3);

    // Create the subscription drain hazard
    controller.hazards.push({
        type: 'subscription_drain',
        x: zoneX,
        y: zoneY,
        radius: 0, // Starts small, grows
        maxRadius: drainRadius,
        drainPerSecond: drainPerSecond,
        duration: duration,
        color: drainColor,
        // Visual properties
        cloudParticles: generateCloudParticles(zoneX, zoneY, drainRadius),
        dollarSigns: [],
        growthRate: 5, // pixels per frame
        pulsePhase: 0
    });

    // Visual effect
    result.specialEffects = result.specialEffects || [];
    result.specialEffects.push({
        type: 'subscription_spawn',
        x: zoneX,
        y: zoneY,
        radius: drainRadius,
        color: drainColor,
        text: '$$$ ABONNEMENT ACTIF $$$'
    });

    // Attack text
    result.attackText = {
        text: 'Frais mensuels: ∞',
        x: enemy.x,
        y: enemy.y - 60,
        color: '#50E6FF',
        duration: 1500
    };

    console.log(`[Attack] Subscription Drain: radius=${drainRadius}, dps=${drainPerSecond}`);
}

/**
 * Generate cloud particles for visual effect
 */
function generateCloudParticles(x, y, radius) {
    const particles = [];
    const count = 12;

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const dist = radius * 0.5 + Math.random() * (radius * 0.3);

        particles.push({
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            size: 20 + Math.random() * 30,
            opacity: 0.3 + Math.random() * 0.3,
            speed: 0.5 + Math.random() * 0.5,
            angle: angle
        });
    }

    return particles;
}

/**
 * Helper: Process subscription drain hazards
 */
export function processSubscriptionDrain(controller, deltaTime, player, result) {
    for (const h of controller.hazards) {
        if (h.type === 'subscription_drain') {
            // Grow radius
            if (h.radius < h.maxRadius) {
                h.radius += h.growthRate;
            }

            // Pulse effect
            h.pulsePhase += deltaTime * 0.005;

            // Update cloud particles
            if (h.cloudParticles) {
                for (const p of h.cloudParticles) {
                    p.angle += p.speed * 0.01;
                    p.x = h.x + Math.cos(p.angle) * (h.radius * 0.5);
                    p.y = h.y + Math.sin(p.angle) * (h.radius * 0.5);
                }
            }

            // Spawn dollar signs occasionally
            if (Math.random() < 0.05) {
                h.dollarSigns.push({
                    x: h.x + (Math.random() - 0.5) * h.radius,
                    y: h.y + (Math.random() - 0.5) * h.radius,
                    vy: -1 - Math.random(),
                    opacity: 1,
                    size: 14 + Math.random() * 10
                });
            }

            // Update dollar signs
            for (let i = h.dollarSigns.length - 1; i >= 0; i--) {
                const d = h.dollarSigns[i];
                d.y += d.vy;
                d.opacity -= 0.02;
                if (d.opacity <= 0) {
                    h.dollarSigns.splice(i, 1);
                }
            }

            // Check if player is in drain zone
            const dx = player.x - h.x;
            const dy = player.y - h.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < h.radius) {
                // Apply drain damage
                const damage = (h.drainPerSecond * deltaTime) / 1000;
                result.playerDamage = (result.playerDamage || 0) + damage;
            }
        }
    }
}
