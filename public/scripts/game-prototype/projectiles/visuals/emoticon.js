// ============================================
// VISUAL: Emoticon
// MSN Messenger style emoticon projectile
// Used by MSN Messenger boss
// ============================================

const EMOTICONS = ['😀', '😃', '😄', '😁', '😆', '🙂', '😉', '😊', '😎', '🤪'];

export function drawEmoticon(ctx, projectile) {
    const x = projectile.x;
    const y = projectile.y;
    const size = projectile.size || 20;

    // Select emoticon based on projectile id or random
    const emoticonIndex = projectile.emoticonIndex ?? Math.floor(Math.random() * EMOTICONS.length);
    const emoticon = EMOTICONS[emoticonIndex % EMOTICONS.length];

    ctx.save();

    // Glow effect
    ctx.shadowColor = projectile.color || '#FFD700';
    ctx.shadowBlur = 8;

    // Draw emoticon
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoticon, x, y);

    ctx.restore();
}
