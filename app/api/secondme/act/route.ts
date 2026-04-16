import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ACT_URL = 'https://api.mindverse.com/gate/lab/api/secondme/act/stream';

/**
 * Act Agent —— 结构化命运预判
 * 在玩家看到选项后立刻调用，输出每个选项的「分身共鸣度」JSON。
 *
 * 需要 chat.write scope（与 Chat Agent 共用同一授权）。
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sm_at')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { message, sceneText, choices } = body;

  if (!sceneText || !Array.isArray(choices) || choices.length === 0) {
    return NextResponse.json({ error: 'sceneText and choices are required' }, { status: 400 });
  }

  // 构建 actionControl：约束模型仅输出合法 JSON，描述每个选项的共鸣度
  const firstChoiceId = choices[0]?.id ?? 'choice_1a';
  const actionControl =
    `仅输出合法 JSON，禁止输出任何解释文字或代码块标记。` +
    `输出结构示例：{"alignedChoiceId": "${firstChoiceId}", "riskLevel": "medium", "intuition": "命运暗流涌动"}。` +
    `alignedChoiceId 必须是以下选项 id 之一：${choices.map((c: { id: string }) => c.id).join('、')}。` +
    `riskLevel 固定取值：low（局势稳定）、medium（隐患潜伏）、high（危机四伏）。` +
    `intuition 为不超过 16 字的赛博朋克风格直觉语句，不含任何引号。` +
    `根据场景文本和各选项含义，选出与用户分身价值观最契合的选项作为 alignedChoiceId，并给出整体风险判断和直觉语句。` +
    `信息不足时兜底输出：{"alignedChoiceId": "${firstChoiceId}", "riskLevel": "medium", "intuition": "命运微光静待显现"}。`;

  const upstreamRes = await fetch(ACT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message ?? `场景：${sceneText.slice(0, 200)}`,
      actionControl,
    }),
  });

  if (!upstreamRes.ok || !upstreamRes.body) {
    return NextResponse.json({ error: 'Upstream Act request failed' }, { status: upstreamRes.status });
  }

  // 透传 SSE 流
  return new NextResponse(upstreamRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
