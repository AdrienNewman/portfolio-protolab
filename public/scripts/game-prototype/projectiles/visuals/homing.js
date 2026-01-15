// ============================================
// VISUAL: Homing
// Triangle pointing in movement direction
// ============================================

/**
 * Draw homing missile projectile
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} projectile - Projectile instance
 */
export function drawHoming(ctx, projectile) {
    const size = projectile.size;

    // Triangle pointing in direction of movement
    const angle = Math.atan2(projectile.vy, projectile.vx);
    ctx.save();
    ctx.rotate(angle - Math.PI / 2 - projectile.rotation);

    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(size / 3, size / 2);
    ctx.lineTo(-size / 3, size / 2);
    ctx.closePath();
    ctx.fill();

    // Glowing trail edge
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.stroke();

    ctx.restore();
}
