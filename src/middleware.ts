import { defineMiddleware } from 'astro:middleware';

// Security headers middleware
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // Clone the response to add headers
  const newResponse = new Response(response.body, response);

  // Security Headers
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS - Enabled for production with HTTPS
  newResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Content Security Policy
  // Allows inline styles (needed for Astro scoped styles) and specific CDNs
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://protolab.ovh",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  newResponse.headers.set('Content-Security-Policy', csp);

  // Permissions Policy (formerly Feature Policy)
  newResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return newResponse;
});
