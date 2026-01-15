// ============================================
// VISUAL: Wave
// Concentric ring style
// ============================================

/**
 * Draw wave ring projectile
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} projectile - Projectile instance
 */
export function drawWave(ctx, projectile) {
    const size = projectile.size;

    // Outer ring
    ctx.strokeStyle = projectile.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Inner fill
    ctx.fillStyle = projectile.color;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
    ctx.fill();
}
