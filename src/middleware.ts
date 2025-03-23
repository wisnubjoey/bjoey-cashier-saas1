import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Definisikan rute publik yang dapat diakses tanpa login
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/pricing(.*)',
  '/api/webhook/clerk(.*)'
]);

// Definisikan rute produk yang memerlukan autentikasi tambahan
const isProductRoute = createRouteMatcher([
  '/organizations/:organizationId/products(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Jika bukan rute publik, lindungi dengan auth
  if (!isPublicRoute(req)) {
    await auth.protect();
    
    // Jika ini adalah rute produk, periksa autentikasi tambahan
    if (isProductRoute(req)) {
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const organizationIdIndex = pathParts.findIndex(part => part === 'organizations') + 1;
      const organizationId = pathParts[organizationIdIndex];
      
      if (organizationId) {
        // Periksa cookie autentikasi
        const cookieStore = await cookies();
        const authCookie = cookieStore.get(`org_auth_${organizationId}`);
        
        if (authCookie?.value !== 'true') {
          // Redirect ke halaman autentikasi jika belum diautentikasi
          return NextResponse.redirect(new URL(`/organizations/${organizationId}/auth`, req.url));
        }
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals dan semua file statis, kecuali ditemukan dalam search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Selalu jalankan untuk API routes
    '/(api|trpc)(.*)',
  ],
};