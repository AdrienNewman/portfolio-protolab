// ============================================
// VISUAL: Bullet
// Elongated bullet shape (burst, spread, aimed)
// ============================================

/**
 * Draw elongated bullet projectile
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} projectile - Projectile instance
 */
export function drawBullet(ctx, projectile) {
    const size = projectile.size;

    ctx.beginPath();
    ctx.ellipse(0, 0, size / 3, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bright tip
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(0, -size / 4, size / 6, 0, Math.PI * 2);
    ctx.fill();
}
