/**
 * DeepSeek LLM 客户端（OpenAI 兼容协议）
 * 服务端专用：读取 DEEPSEEK_API_KEY / DEEPSEEK_BASE_URL / DEEPSEEK_MODEL
 */

const BASE_URL = (
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
).replace(/\/+$/, "");
const API_KEY = process.env.DEEPSEEK_API_KEY || "";
export const LLM_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

/** 是否已配置 LLM key（未配置时编排层走内置模板降级） */
export const isLLMConfigured = () => Boolean(API_KEY);

export class LLMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LLMError";
  }
}

interface ChatChoice {
  message?: { content?: string | null };
}

/**
 * 调用 Chat Completions，强制 JSON 输出，返回模型文本
 * 注意：DeepSeek json_object 模式要求提示词中包含 "json" 字样（prompt.ts 已满足）
 */
export async function chatJSON(
  system: string,
  user: string,
  timeoutMs = 120_000
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 1.1,
        max_tokens: 8000,
        stream: false,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    throw new LLMError(`LLM 请求失败（网络/超时）：${reason}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new LLMError(
      `LLM API ${res.status}${body ? `：${body.slice(0, 200)}` : ""}`
    );
  }

  const data = (await res.json()) as { choices?: ChatChoice[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new LLMError("LLM 返回内容为空");
  return content;
}
