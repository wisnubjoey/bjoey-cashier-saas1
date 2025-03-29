import { NextRequest, NextResponse } from 'next/server';

export function requireAdminAuth(request: NextRequest) {
  // Halaman yang memerlukan autentikasi admin
  const protectedPaths = [
    '/products',
    '/inventory',
    '/settings'
  ];
  
  // Cek apakah path saat ini termasuk dalam protected paths
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.includes(path)
  );
  
  // Jika bukan protected path, lanjutkan
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Jika ini adalah halaman auth, lanjutkan
  if (request.nextUrl.pathname.includes('/auth')) {
    return NextResponse.next();
  }
  
  // Redirect ke halaman auth dengan returnUrl
  const orgId = request.nextUrl.pathname.split('/')[2]; // Ambil organizationId dari URL
  const returnUrl = request.nextUrl.pathname;
  
  return NextResponse.redirect(
    new URL(`/organizations/${orgId}/auth?returnUrl=${encodeURIComponent(returnUrl)}`, request.url)
  );
}