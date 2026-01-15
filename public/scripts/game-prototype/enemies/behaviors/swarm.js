// ============================================
// BEHAVIOR: Swarm
// Small fast units with wave movement
// ============================================

export const behaviorSwarm = {
    name: 'swarm',
    description: 'Petites unités rapides avec mouvement ondulant',

    params: {
        waveAmplitude: { type: 'number', default: 2 },
        waveFrequency: { type: 'number', default: 5 }
    },

    /**
     * Update enemy position with swarm wave
     * @param {object} enemy - Enemy instance
     * @param {object} params - Behavior parameters
     * @param {number} deltaTime - Time since last frame
     * @returns {object} Result flags
     */
    update: (enemy, params, deltaTime) => {
        const waveAmplitude = params.waveAmplitude ?? 2;
        const waveFrequency = params.waveFrequency ?? 5;
        const effectiveSpeed = enemy.speed * enemy.slowMoMultiplier;

        enemy.y += effectiveSpeed;
        enemy.x += Math.sin(enemy.angle * waveFrequency + enemy.waveOffset) * waveAmplitude;

        return { overrideMovement: true };
    }
};
