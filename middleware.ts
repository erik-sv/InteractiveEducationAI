import { NextRequest, NextResponse } from 'next/server';

/**
 * Subdomain routing middleware for Cloudflare+Nginx+Railway setup.
 * - healthcare.advantageintegrationai.com/ rewrites to /healthcare
 * - education.advantageintegrationai.com/ rewrites to /education
 * - Other paths (e.g., education.advantageintegrationai.com/foo) are served as /foo.
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;

  // Default education.yourdomain.com/ to /education
  if (host.startsWith('education.') && pathname === '/') {
    return NextResponse.rewrite(new URL('/education', req.url));
  }

  // Default healthcare.yourdomain.com/ to /healthcare
  if (host.startsWith('healthcare.') && pathname === '/') {
    return NextResponse.rewrite(new URL('/healthcare', req.url));
  }

  // For all other paths on any subdomain, or for other subdomains entirely,
  // let Next.js handle the path as is. This ensures that
  // education.yourdomain.com/somepage serves the content of /somepage.
  return NextResponse.next();
}

// Apply to all routes
export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
};
