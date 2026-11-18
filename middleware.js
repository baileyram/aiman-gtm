import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
export function middleware(req) {
 const { pathname } = req.nextUrl;
 if (pathname === '/login' || pathname === '/api/login') return NextResponse.next();
 const secret = process.env.SESSION_SECRET;
 if (!secret || !process.env.PORTAL_PASSWORD) return new NextResponse('Portal not configured', {status:503});
 const token = req.cookies.get('aiman_session')?.value || '';
 const expected = createHmac('sha256', secret).update('aiman-portal-v1').digest('hex');
 const a = Buffer.from(token), b = Buffer.from(expected);
 if (a.length !== b.length || !timingSafeEqual(a,b)) return NextResponse.redirect(new URL('/login',req.url));
 return NextResponse.next();
}