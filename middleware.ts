import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- SITE OFFLINE ---
  // Allow: /admin routes, /api routes (cron jobs), static assets
  const isAdmin = pathname.startsWith('/admin')
  const isApi   = pathname.startsWith('/api')
  const isAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon')

  if (!isAdmin && !isApi && !isAsset) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bourbon Pour — Coming Soon</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a;
      color: #e8dcc8;
      font-family: 'Georgia', serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 32px;
    }
    .wrap { max-width: 480px; }
    .logo {
      width: 56px; height: 56px; border-radius: 50%;
      background: #c8963e;
      color: #0a0a0a;
      font-size: 24px; font-weight: 900;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
    }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.5px; }
    p  { font-size: 15px; color: #888; line-height: 1.7; }
    .bar {
      width: 40px; height: 2px;
      background: #c8963e;
      margin: 24px auto;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">B</div>
    <h1>Bourbon Pour</h1>
    <div class="bar"></div>
    <p>
      This site is temporarily unavailable while we complete
      required compliance and regulatory review.
      We appreciate your patience.
    </p>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    )
  }

  // Protect /admin routes (except /admin/login)
  if (isAdmin && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_token')?.value
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
