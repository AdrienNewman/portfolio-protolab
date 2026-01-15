// ============================================
// VISUAL: Letter
// BSOD-style letter projectile (EULA)
// ============================================

/**
 * Draw letter projectile (BSOD style)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} projectile - Projectile instance
 */
export function drawLetter(ctx, projectile) {
    const size = projectile.size;
    const halfSize = size / 2;

    // Blue background
    ctx.fillStyle = '#0078D4';
    ctx.fillRect(-halfSize, -halfSize, size, size);

    // Border
    ctx.strokeStyle = '#4DA6FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfSize, -halfSize, size, size);

    // Letter centered in white
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(projectile.letter || 'E', 0, 0);
}
