import { NextRequest, NextResponse } from 'next/server';

/**
 * Subdomain routing middleware for Cloudflare+Nginx+Railway setup.
 * Allows routing based on subdomain (Host header).
 * - demos.advantageintegrationai.com -> /
 * - education.advantageintegrationai.com -> /education
 * - healthcare.advantageintegrationai.com -> /healthcare
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';

  if (host.startsWith('education.')) {
    return NextResponse.rewrite(new URL('/education', req.url));
  }
  if (host.startsWith('healthcare.')) {
    return NextResponse.rewrite(new URL('/healthcare', req.url));
  }

  // Default: demos or root
  return NextResponse.next();
}

// Apply to all routes
export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
};
