import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Definisikan rute publik yang dapat diakses tanpa login
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/pricing(.*)',
  '/api/webhook/clerk(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Jika bukan rute publik, lindungi dengan auth
  if (!isPublicRoute(req)) {
    await auth.protect();
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