import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Vi släpper igenom trafik och låter admin-sidan (Client Side) 
  // kolla om man är inloggad istället. Det löser problemet med att det fastnar.
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}