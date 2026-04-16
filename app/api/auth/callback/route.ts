import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CLIENT_ID = process.env.SECONDME_CLIENT_ID!;
const CLIENT_SECRET = process.env.SECONDME_CLIENT_SECRET!;
const REDIRECT_URI = process.env.SECONDME_REDIRECT_URI!;
const TOKEN_URL = 'https://api.mindverse.com/gate/lab/api/oauth/token/code';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const cookieStore = await cookies();

  // 处理用户拒绝授权的情况
  if (errorParam) {
    return NextResponse.redirect(new URL('/?auth=denied', request.nextUrl.origin));
  }

  // 验证 code 和 state 是否存在
  if (!code || !state) {
    return NextResponse.redirect(new URL('/?auth=error', request.nextUrl.origin));
  }

  // 验证 CSRF state
  const savedState = cookieStore.get('sm_oauth_state')?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL('/?auth=error', request.nextUrl.origin));
  }

  // 清除 state cookie
  cookieStore.delete('sm_oauth_state');

  // 用授权码换取 Access Token（服务端请求，Client Secret 不暴露到客户端）
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    console.error('Token exchange failed:', await tokenRes.text());
    return NextResponse.redirect(new URL('/?auth=error', request.nextUrl.origin));
  }

  const tokenData = await tokenRes.json();

  if (tokenData.code !== 0 || !tokenData.data?.accessToken) {
    console.error('Token exchange error:', tokenData);
    return NextResponse.redirect(new URL('/?auth=error', request.nextUrl.origin));
  }

  const { accessToken, refreshToken, expiresIn } = tokenData.data;

  // 将 Access Token 存入 HttpOnly cookie
  cookieStore.set('sm_at', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresIn ?? 7 * 24 * 3600, // 默认 7 天
    path: '/',
  });

  // Refresh Token 有效期 365 天
  if (refreshToken) {
    cookieStore.set('sm_rt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 3600,
      path: '/',
    });
  }

  return NextResponse.redirect(new URL('/?auth=success', request.nextUrl.origin));
}
