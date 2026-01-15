// ============================================
// BEHAVIOR: Zigzag
// Enemy moves downward with horizontal sine wave
// ============================================

export const behaviorZigzag = {
    name: 'zigzag',
    description: 'Mouvement descendant avec oscillation horizontale sinusoïdale',

    params: {
        amplitude: { type: 'number', default: 3 },
        frequency: { type: 'number', default: 3 }
    },

    /**
     * Update enemy position
     * @param {object} enemy - Enemy instance
     * @param {object} params - Behavior parameters
     * @param {number} deltaTime - Time since last frame (unused, frame-based)
     * @returns {object} Result flags
     */
    update: (enemy, params, deltaTime) => {
        const amplitude = params.amplitude ?? 3;
        const frequency = params.frequency ?? 3;
        const effectiveSpeed = enemy.speed * enemy.slowMoMultiplier;

        enemy.y += effectiveSpeed;
        enemy.x += Math.sin(enemy.angle * frequency) * amplitude;

        return { overrideMovement: true };
    }
};
