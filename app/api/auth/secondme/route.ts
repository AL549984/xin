import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const CLIENT_ID = process.env.SECONDME_CLIENT_ID!;
const REDIRECT_URI = process.env.SECONDME_REDIRECT_URI!;
const SCOPES = ['userinfo', 'chat.write'].join(' ');

export async function GET() {
  // 生成 CSRF state 随机字符串
  const state = crypto.randomBytes(16).toString('hex');

  // 将 state 存入 HttpOnly cookie（5 分钟有效）
  const cookieStore = await cookies();
  cookieStore.set('sm_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300, // 5 分钟
    path: '/',
  });

  const authUrl = new URL('https://go.second-me.cn/oauth/');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
