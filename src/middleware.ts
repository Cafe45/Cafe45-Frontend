import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Kolla om användaren försöker nå admin-sidorna
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Undantag: Låt dem nå inloggningssidan utan lösenord (annars blir det loop)
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Kolla om kakan "admin_session" finns
    const adminSession = request.cookies.get('admin_session');

    // Om ingen kaka finns -> Skicka till login
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Berätta för Next.js vilka vägar som ska skyddas
export const config = {
  matcher: '/admin/:path*',
};