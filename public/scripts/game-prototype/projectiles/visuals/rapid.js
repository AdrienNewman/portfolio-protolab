// ============================================
// VISUAL: Rapid
// Small fast bullet
// ============================================

/**
 * Draw rapid fire projectile
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} projectile - Projectile instance
 */
export function drawRapid(ctx, projectile) {
    const size = projectile.size;

    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
}
