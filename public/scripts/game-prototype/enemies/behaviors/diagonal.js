// ============================================
// BEHAVIOR: Diagonal
// Enemy moves diagonally, bouncing off edges
// ============================================

export const behaviorDiagonal = {
    name: 'diagonal',
    description: 'Mouvement diagonal avec rebond sur les bords',

    params: {
        speedMultiplier: { type: 'number', default: 0.8 },
        bounceMargin: { type: 'number', default: 50 }
    },

    /**
     * Update enemy position
     * @param {object} enemy - Enemy instance
     * @param {object} params - Behavior parameters
     * @param {number} deltaTime - Time since last frame
     * @returns {object} Result flags
     */
    update: (enemy, params, deltaTime) => {
        const speedMultiplier = params.speedMultiplier ?? 0.8;
        const bounceMargin = params.bounceMargin ?? 50;
        const effectiveSpeed = enemy.speed * enemy.slowMoMultiplier;

        enemy.y += effectiveSpeed;
        enemy.x += effectiveSpeed * speedMultiplier * enemy.direction;

        // Bounce off edges
        if (enemy.x < bounceMargin || enemy.x > enemy.canvasWidth - bounceMargin) {
            enemy.direction *= -1;
        }

        return { overrideMovement: true };
    }
};
