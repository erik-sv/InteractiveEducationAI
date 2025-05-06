import { NextRequest, NextResponse } from 'next/server';

/**
 * Subdomain routing middleware for Cloudflare+Nginx+Railway setup.
 * - healthcare.advantageintegrationai.com -> /healthcare
 * - education.advantageintegrationai.com -> /education
 * - all other subdomains -> /
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';

  if (host.startsWith('healthcare.')) {
    return NextResponse.rewrite(new URL('/healthcare', req.url));
  }
  
  if (host.startsWith('education.')) {
    return NextResponse.rewrite(new URL('/education', req.url));
  }

  // Default: all other subdomains go to main index
  return NextResponse.next();
}

// Apply to all routes
export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
};
