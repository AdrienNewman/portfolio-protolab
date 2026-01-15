// ============================================
// BEHAVIOR: Wave
// Horizontal wave movement (wider amplitude)
// ============================================

export const behaviorWave = {
    name: 'wave',
    description: 'Mouvement horizontal ondulant large',

    params: {
        speedMultiplier: { type: 'number', default: 0.8 },
        waveAmplitude: { type: 'number', default: 4 },
        waveFrequency: { type: 'number', default: 2 }
    },

    /**
     * Update enemy position with wave motion
     * @param {object} enemy - Enemy instance
     * @param {object} params - Behavior parameters
     * @param {number} deltaTime - Time since last frame
     * @returns {object} Result flags
     */
    update: (enemy, params, deltaTime) => {
        const speedMultiplier = params.speedMultiplier ?? 0.8;
        const waveAmplitude = params.waveAmplitude ?? 4;
        const waveFrequency = params.waveFrequency ?? 2;
        const effectiveSpeed = enemy.speed * enemy.slowMoMultiplier;

        enemy.y += effectiveSpeed * speedMultiplier;
        enemy.x += Math.sin(enemy.angle * waveFrequency + enemy.waveOffset) * waveAmplitude;

        return { overrideMovement: true };
    }
};
