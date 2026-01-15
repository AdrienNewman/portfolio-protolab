// ============================================
// VISUAL: Swarm
// Small triangle swarm unit
// ============================================

/**
 * Draw swarm-type enemy (small triangle)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} enemy - Enemy instance
 * @param {string} color - Display color
 */
export function drawSwarm(ctx, enemy, color) {
    const half = enemy.size / 2;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(half * 0.7, half * 0.7);
    ctx.lineTo(-half * 0.7, half * 0.7);
    ctx.closePath();
    ctx.fill();
}
