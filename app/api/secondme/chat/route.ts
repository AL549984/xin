import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STREAM_URL = 'https://api.mindverse.com/gate/lab/api/secondme/chat/stream';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sm_at')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { message } = body;

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  const upstreamRes = await fetch(STREAM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!upstreamRes.ok || !upstreamRes.body) {
    return NextResponse.json({ error: 'Upstream request failed' }, { status: upstreamRes.status });
  }

  // 透传 SSE 流到客户端
  return new NextResponse(upstreamRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
