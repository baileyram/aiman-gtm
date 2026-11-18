import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
export async function POST(req) {
 const secret=process.env.SESSION_SECRET, expected=process.env.PORTAL_PASSWORD;
 if(!secret||!expected) return new NextResponse('Not configured',{status:503});
 const form=await req.formData();
 const supplied=String(form.get('password')||'');
 const a=Buffer.from(supplied), b=Buffer.from(expected);
 if(a.length!==b.length||!timingSafeEqual(a,b)) return NextResponse.redirect(new URL('/login?error=1',req.url),303);
 const token=createHmac('sha256',secret).update('aiman-portal-v1').digest('hex');
 const res=NextResponse.redirect(new URL('/',req.url),303);
 res.cookies.set('aiman_session',token,{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:60*60*8});
 return res;
}