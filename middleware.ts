import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { isMaintenanceMode, maintenancePage } from '@/lib/maintenance'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // Maintenance gate for the public site.
  // Skips: /admin (owner area), /api (keeps admin + tooling working). Logged-in
  // owner (valid admin_token) bypasses so they can preview the live site.
  if (
    isMaintenanceMode() &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api')
  ) {
    const token = request.cookies.get('admin_token')?.value
    const isOwner = token ? await verifyAdminToken(token) : false
    if (!isOwner) {
      return new NextResponse(maintenancePage(), {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '3600',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  // Run on all routes except Next internals, static assets, and crawler files
  // (robots.txt / sitemap.xml / rss.xml stay reachable during maintenance).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|rss.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
