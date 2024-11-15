import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req });
  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
  const isResellerPage = req.nextUrl.pathname.startsWith('/reseller');
  const isProfilePage = req.nextUrl.pathname.startsWith('/profile');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return null;
  }

  if (!isAuth && (isAdminPage || isResellerPage || isProfilePage)) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  // Admin access check
  if (isAdminPage && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Reseller access check
  if (isResellerPage) {
    if (token?.role !== 'reseller') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Check if reseller is approved
    if (token?.status !== 'active') {
      return NextResponse.redirect(new URL('/auth/reseller/signin/error', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/reseller/:path*',
    '/auth/:path*',
    '/profile/:path*',
  ],
};