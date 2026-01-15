// ============================================
// VISUAL: Rain
// Teardrop shape
// ============================================

/**
 * Draw raindrop projectile
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} projectile - Projectile instance
 */
export function drawRain(ctx, projectile) {
    const size = projectile.size;

    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.quadraticCurveTo(size / 2, 0, 0, size / 2);
    ctx.quadraticCurveTo(-size / 2, 0, 0, -size / 2);
    ctx.fill();
}
