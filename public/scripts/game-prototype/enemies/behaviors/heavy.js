// ============================================
// BEHAVIOR: Heavy
// Slow movement with subtle oscillation
// ============================================

export const behaviorHeavy = {
    name: 'heavy',
    description: 'Mouvement lent avec légère oscillation',

    params: {
        speedMultiplier: { type: 'number', default: 0.8 },
        waveAmplitude: { type: 'number', default: 1.5 }
    },

    /**
     * Update enemy position with slight wave
     * @param {object} enemy - Enemy instance
     * @param {object} params - Behavior parameters
     * @param {number} deltaTime - Time since last frame
     * @returns {object} Result flags
     */
    update: (enemy, params, deltaTime) => {
        const speedMultiplier = params.speedMultiplier ?? 0.8;
        const waveAmplitude = params.waveAmplitude ?? 1.5;
        const effectiveSpeed = enemy.speed * enemy.slowMoMultiplier;

        enemy.y += effectiveSpeed * speedMultiplier;
        enemy.x += Math.sin(enemy.angle) * waveAmplitude;

        return { overrideMovement: true };
    }
};
