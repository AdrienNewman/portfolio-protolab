// ============================================
// ATTACK: Help Bubble
// Boss: CLIPPY (L7)
// Slow homing bubbles that track the player
// ============================================

/**
 * Help Bubble Attack
 * Spawns slow homing "help" bubbles that track the player
 *
 * @param {object} controller - BossBehaviorController
 * @param {object} attack - Attack config
 * @param {object} enemy - Enemy entity
 * @param {object} player - Player entity
 * @param {object} result - Result object
 */
export function attackHelpBubble(controller, attack, enemy, player, result) {
    const bubbleCount = attack.bubbleCount || 3;
    const trackingSpeed = attack.trackingSpeed || 0.02;
    const duration = attack.duration || 5000;
    const damage = attack.damage || 8;
    const bubbleSize = attack.bubbleSize || 25;
    const bubbleColor = attack.bubbleColor || '#0078D4';
    const bubbleSpeed = attack.bubbleSpeed || 2;

    // Spawn bubbles in arc around boss
    const startAngle = -Math.PI / 2 - Math.PI / 4;
    const angleStep = (Math.PI / 2) / Math.max(1, bubbleCount - 1);

    for (let i = 0; i < bubbleCount; i++) {
        const angle = startAngle + angleStep * i;
        const spawnDistance = 50;

        controller.projectiles.push({
            x: enemy.x + Math.cos(angle) * spawnDistance,
            y: enemy.y + Math.sin(angle) * spawnDistance,
            vx: Math.cos(angle) * bubbleSpeed,
            vy: Math.sin(angle) * bubbleSpeed,
            size: bubbleSize,
            color: bubbleColor,
            damage: damage,
            type: 'homing',
            target: player,
            homingStrength: trackingSpeed,
            lifetime: duration,
            rotation: 0,
            rotationSpeed: 0.05,
            // Visual properties
            shape: 'help_bubble',
            questionMark: true,
            glowColor: '#FFD700'
        });
    }

    // Visual effect - speech bubble
    result.attackText = {
        text: 'Besoin d\'aide ?',
        x: enemy.x,
        y: enemy.y - 50,
        color: '#FFFF00',
        duration: 1500
    };

    console.log(`[Attack] Help Bubble: count=${bubbleCount}, trackingSpeed=${trackingSpeed}`);
}
