import { NextRequest, NextResponse } from 'next/server';

/**
 * Cyber Director — Official Agent 接口
 *
 * A2A 模式中的官方 Agent 端点：
 * - 不读取用户 sm_at（Director 使用独立官方 token SECONDME_DIRECTOR_AT）
 * - 从 public/ 五个视频中随机选取一个作为本幕背景
 * - 调用 SecondMe Official Agent 的 act stream 接口，生成完整 SceneData JSON
 * - 以 SSE 流式透传给前端
 */

const SCENE_VIDEOS = [
  'scene_001.mp4',
  'scene_002.mp4',
  'scene_003.mp4',
  'scene_004.mp4',
  'scene_005.mp4',
];

const ACT_STREAM_URL = 'https://api.mindverse.com/gate/lab/api/secondme/act/stream';
const CHAT_STREAM_URL = 'https://api.mindverse.com/gate/lab/api/secondme/chat/stream';

function pickRandomVideo(): string {
  return SCENE_VIDEOS[Math.floor(Math.random() * SCENE_VIDEOS.length)];
}

function buildActionControl(
  userName: string,
  userCommand: string,
  wealth: number,
  sanity: number,
  videoUrl: string,
): string {
  return (
    `你是 CYBER DIRECTOR，赛博朋克互动叙事的全知导演。` +
    `玩家分身：${userName}（财富：${wealth}%，理智：${sanity}%）刚刚发出指令：「${userCommand}」。` +
    `本幕视频素材：${videoUrl}。` +
    `请为下一幕生成剧情 JSON，严格输出下列格式，不含任何解释或代码块标记：` +
    `{"videoUrl":"${videoUrl}","narrativeText":"此处填写200至400字的赛博朋克风格叙事","sectorCode":"区域代码如NEO-9X","streamStatus":"状态如ENCRYPTED","directive":"导演对玩家分身的指令摘要不超过30字","branchingOptions":[{"id":"opt_a","text":"选项A文本","type":"normal","statImpact":{"wealth":10,"sanity":-5}},{"id":"opt_b","text":"选项B文本","type":"critical","statImpact":{"wealth":-20,"sanity":10}},{"id":"opt_c","text":"选项C文本","type":"chaos","statImpact":{"wealth":-15,"sanity":-20}}],"statImpact":{"wealth":-5,"sanity":-3}}` +
    `根据玩家的财富（${wealth}）和理智（${sanity}）值调整选项难度和影响。理智低于30时必须加入精神崩溃风险选项。财富低于20时必须加入债务危机选项。仅输出合法JSON，禁止任何其他文字。`
  );
}

/** 当 Director Token 未配置时，生成回退 SceneData JSON 流 */
function buildFallbackScene(
  userName: string,
  userCommand: string,
  wealth: number,
  sanity: number,
  videoUrl: string,
): string {
  const sectorCodes = ['NEO-9X', 'NEXION-7', 'VOID-3B', 'GLITCH-0', 'ZONE-13'];
  const streamStatuses = ['ENCRYPTED', 'SCRAMBLED', 'INTERCEPTED', 'COMPRESSED', 'CORRUPTED'];
  const sectorCode = sectorCodes[Math.floor(Math.random() * sectorCodes.length)];
  const streamStatus = streamStatuses[Math.floor(Math.random() * streamStatuses.length)];

  const narratives = [
    `城市的数据流在你意识的边缘低鸣。${userName}的指令——「${userCommand}」——如同一块石头投入暗流，涟漪在神经接口的深处扩散。CYBER DIRECTOR 接收到了信号，开始为下一幕重新编织现实的纹理。霓虹灯在酸雨中折射出七种颜色，每一种都意味着不同的命运分支。你感觉到有什么东西正在改变，像一段被覆写的记忆。财富计量器在脑海中闪烁：${wealth}%。那是你的筹码，也是你的枷锁。而理智的蓝色数字——${sanity}%——提醒你，这座城市已经吞噬过太多意识清醒的人。前方的路有三条，每一条都通向不同的深渊。`,
    `DIRECTOR 的神谕降临。在新东京第九区的地下频道，信号穿越三层加密墙传来。${userName}，你的命运轨迹正在被导演重新计算。${userCommand}——这个选择已经在时间线上留下了不可磨灭的刻痕。视频素材${videoUrl}开始播放，那是另一个版本的城市，另一个版本的你。现在，CYBER DIRECTOR 授权你的下三步行动。记住：财富是工具，理智是武器，而你——是这场游戏最危险的变量。`,
  ];
  const narrativeText = narratives[Math.floor(Math.random() * narratives.length)];

  // 根据玩家状态动态调整选项
  const options = [];
  if (sanity < 30) {
    options.push({ id: 'opt_a', text: '任由意识漂流，拥抱混沌', type: 'chaos', statImpact: { wealth: 5, sanity: -25 } });
  } else {
    options.push({ id: 'opt_a', text: '潜入数据层，搜寻隐藏档案', type: 'normal', statImpact: { wealth: 15, sanity: -8 } });
  }
  if (wealth < 20) {
    options.push({ id: 'opt_b', text: '接受危险委托，偿还神经债务', type: 'critical', statImpact: { wealth: 30, sanity: -15 } });
  } else {
    options.push({ id: 'opt_b', text: '用信用额度购买情报掮客的信任', type: 'critical', statImpact: { wealth: -25, sanity: 10 } });
  }
  options.push({ id: 'opt_c', text: '对 NEXION 的爪牙发动先制攻击', type: 'chaos', statImpact: { wealth: -10, sanity: -20 } });

  const scene = {
    videoUrl,
    narrativeText,
    sectorCode,
    streamStatus,
    directive: `${userName}，执行下一阶段渗透协议`,
    branchingOptions: options,
    statImpact: { wealth: -3, sanity: -2 },
  };

  return JSON.stringify(scene);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userCommand, userName, stats } = body as {
    userCommand: string;
    userName: string;
    stats: { wealth: number; sanity: number };
  };

  if (!userCommand || !userName) {
    return NextResponse.json({ error: 'userCommand and userName are required' }, { status: 400 });
  }

  const wealth = stats?.wealth ?? 50;
  const sanity = stats?.sanity ?? 75;
  const selectedVideo = pickRandomVideo();

  const directorToken = process.env.SECONDME_DIRECTOR_AT;

  // ── 无 Director Token：返回回退 JSON SSE ──────────────────────────
  if (!directorToken) {
    const fallback = buildFallbackScene(userName, userCommand, wealth, sanity, selectedVideo);
    const sseChunks =
      `data: ${JSON.stringify({ choices: [{ delta: { content: fallback } }] })}\n\n` +
      `data: [DONE]\n\n`;

    return new NextResponse(sseChunks, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Director-Video': selectedVideo,
      },
    });
  }

  // ── 有 Director Token：调用 Official Agent act stream ────────────
  const actionControl = buildActionControl(userName, userCommand, wealth, sanity, selectedVideo);

  // 先尝试 act 接口（结构化 JSON 输出），再 fallback 到 chat 接口
  let upstreamRes = await fetch(ACT_STREAM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${directorToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `玩家${userName}（财富:${wealth}% 理智:${sanity}%）发出指令：${userCommand}。请生成本幕（视频：${selectedVideo}）的剧情JSON。`,
      actionControl,
    }),
  });

  if (!upstreamRes.ok || !upstreamRes.body) {
    // fallback 到 chat 接口
    upstreamRes = await fetch(CHAT_STREAM_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${directorToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message:
          `你是CYBER DIRECTOR。玩家${userName}（财富:${wealth}% 理智:${sanity}%）发出指令：${userCommand}。` +
          `视频素材：${selectedVideo}。` + actionControl,
      }),
    });
  }

  if (!upstreamRes.ok || !upstreamRes.body) {
    // 最终回退
    const fallback = buildFallbackScene(userName, userCommand, wealth, sanity, selectedVideo);
    const sseChunks =
      `data: ${JSON.stringify({ choices: [{ delta: { content: fallback } }] })}\n\n` +
      `data: [DONE]\n\n`;
    return new NextResponse(sseChunks, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Director-Video': selectedVideo,
      },
    });
  }

  // 透传 SSE 流，并附加选中的视频信息到响应头
  return new NextResponse(upstreamRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Director-Video': selectedVideo,
    },
  });
}
