// ============================================
// VISUAL: Popup Window
// Windows-style popup error window
// ============================================

/**
 * Draw popup window projectile
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} projectile - Projectile instance
 */
export function drawPopup(ctx, projectile) {
    const size = projectile.size;
    const halfSize = size / 2;

    // Window background (off-white)
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(-halfSize, -halfSize, size, size);

    // Title bar (blue)
    ctx.fillStyle = '#0078D4';
    ctx.fillRect(-halfSize, -halfSize, size, size * 0.25);

    // Close button (red X)
    ctx.fillStyle = '#E81123';
    ctx.fillRect(halfSize - size * 0.25, -halfSize, size * 0.25, size * 0.25);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', halfSize - size * 0.125, -halfSize + size * 0.125);

    // Warning icon
    ctx.fillStyle = '#FFB900';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.fillText('⚠', 0, size * 0.15);

    // Border
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfSize, -halfSize, size, size);
}
