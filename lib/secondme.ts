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
