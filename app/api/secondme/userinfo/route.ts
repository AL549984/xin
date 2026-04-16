import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CLIENT_ID = process.env.SECONDME_CLIENT_ID!;
const CLIENT_SECRET = process.env.SECONDME_CLIENT_SECRET!;
const REFRESH_URL = 'https://api.mindverse.com/gate/lab/api/oauth/token/refresh';

/** 服务端刷新 Access Token（内部工具函数） */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(REFRESH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (data.code !== 0 || !data.data?.accessToken) return null;
  return data.data.accessToken;
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sm_at')?.value;

  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // 调用 SecondMe 用户信息接口
  let res = await fetch('https://api.mindverse.com/gate/lab/api/secondme/user/info', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Access Token 过期时尝试用 Refresh Token 刷新
  if (res.status === 401) {
    const refreshToken = cookieStore.get('sm_rt')?.value;
    if (!refreshToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const newToken = await refreshAccessToken(refreshToken);
    if (!newToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    cookieStore.set('sm_at', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600,
      path: '/',
    });

    res = await fetch('https://api.mindverse.com/gate/lab/api/secondme/user/info', {
      headers: { Authorization: `Bearer ${newToken}` },
    });
  }

  if (!res.ok) {
    return NextResponse.json({ authenticated: false }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ authenticated: true, user: data.data });
}

/** 登出：清除 Token cookie */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('sm_at');
  cookieStore.delete('sm_rt');
  return NextResponse.json({ success: true });
}
