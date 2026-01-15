// ============================================
// ATTACK: Circular Wave
// Fires projectiles in expanding circular waves
// ============================================

/**
 * Execute circular wave attack
 * @param {object} controller - BossBehaviorController instance
 * @param {object} attack - Attack configuration
 * @param {object} enemy - Enemy entity
 * @param {object} result - Result object to populate
 */
export function attackCircularWave(controller, attack, enemy, result) {
    for (let wave = 0; wave < attack.waveCount; wave++) {
        setTimeout(() => {
            const angleStep = (Math.PI * 2) / attack.projectilesPerWave;
            for (let i = 0; i < attack.projectilesPerWave; i++) {
                const angle = angleStep * i + (wave * 0.2);
                result.projectiles.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.cos(angle) * attack.projectileSpeed,
                    vy: Math.sin(angle) * attack.projectileSpeed,
                    size: attack.projectileSize,
                    color: attack.projectileColor,
                    damage: attack.damage,
                    type: 'wave'
                });
            }
        }, wave * attack.waveDelay);
    }
}
