import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export const config = {
  matcher: ['/admin/:path*'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 환경변수 누락 시 로그인 페이지로 (500 방지)
  if (!process.env.SESSION_SECRET) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}
