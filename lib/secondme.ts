/** SecondMe API 类型定义 */

export interface SecondMeUser {
  name: string;
  bio: string;
  avatar: string;
  email?: string;
  /** 用户兴趣标签（来自 userinfo scope） */
  interests?: string[];
}

export interface SecondMeTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string[];
}

export interface SecondMeApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** SSE 聊天事件：session 事件 */
export interface SecondMeSessionEvent {
  sessionId: string;
}

/** SSE 聊天事件：消息增量 */
export interface SecondMeChatDelta {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
}

// ─── Act Agent 类型 ─────────────────────────────────────────────

/**
 * Act Agent 输出结构：分身对当前场景选项的结构化预判。
 */
export interface SecondMeActResult {
  /** 与用户分身最契合的选项 id */
  alignedChoiceId: string;
  /** 场景整体风险等级 */
  riskLevel: 'low' | 'medium' | 'high';
  /** 不超过 18 字的分身直觉语句 */
  intuition: string;
}

/**
 * 解析 SecondMe Act SSE 流，将全部增量文本拼接后 JSON.parse，触发 onResult。
 * 流结束时调用 onDone。
 */
export async function parseSecondMeAct(
  response: Response,
  onResult: (result: SecondMeActResult) => void,
  onDone: () => void,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          // 从累积文本中提取 JSON 块（兼容模型输出 ```json 代码块等情况）
          try {
            const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('no JSON found');
            const result = JSON.parse(jsonMatch[0]) as SecondMeActResult;
            onResult(result);
          } catch {
            onResult({ alignedChoiceId: '', riskLevel: 'medium', intuition: '信号微弱，命运未知' });
          }
          onDone();
          return;
        }
        try {
          const json = JSON.parse(payload);
          const content: string = json.choices?.[0]?.delta?.content ?? '';
          if (content) accumulated += content;
        } catch {
          // 忽略非数据行（session 事件等）
        }
      }
    }
  }

  // reader 自然结束但未收到 [DONE]，也尝试解析
  if (accumulated) {
    try {
      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]) as SecondMeActResult;
        onResult(result);
      }
    } catch {
      // 忽略
    }
  }
  onDone();
}

// ─── Chat Agent 类型 ─────────────────────────────────────────────

/**
 * 解析 SecondMe 流式聊天 SSE 响应。
 * onToken 在每个文本增量时调用，onDone 在流结束时调用。
 */
export async function parseSecondMeStream(
  response: Response,
  onToken: (token: string) => void,
  onDone: () => void,
) {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          onDone();
          return;
        }
        try {
          const json: SecondMeChatDelta = JSON.parse(payload);
          const content = json.choices?.[0]?.delta?.content;
          if (content) onToken(content);
        } catch {
          // 忽略非 JSON 行（如 session 事件）
        }
      }
    }
  }

  onDone();
}
