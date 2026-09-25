/**
 * 结构化输出解析：从 LLM 文本中提取 JSON 并做强校验/规范化
 * 任何一步不满足结构约定即抛 AgentParseError，由编排层决定重试或降级
 */
import type { ItemCategory, ItineraryDay, PlanResult } from "@/lib/types";

export class AgentParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentParseError";
  }
}

const CATEGORIES: ItemCategory[] = ["交通", "美食", "景点", "文化", "休闲", "住宿"];

/** 提取 JSON 文本：容忍 ```json 围栏与首尾杂文本 */
function extractJSON(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : trimmed;

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new AgentParseError("输出中未找到 JSON 对象");
  }
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw new AgentParseError("JSON 语法解析失败");
  }
}

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;

/** 校验并规范化 LLM 输出；expectedDays 不匹配时抛错 */
export function normalizePlanResult(
  text: string,
  expectedDays: number
): PlanResult {
  const root = extractJSON(text) as Record<string, unknown>;
  if (!root || typeof root !== "object") {
    throw new AgentParseError("JSON 根节点不是对象");
  }

  const rawDays = Array.isArray(root.days) ? root.days : null;
  if (!rawDays || rawDays.length === 0) {
    throw new AgentParseError("缺少 days 字段或为空数组");
  }
  if (rawDays.length !== expectedDays) {
    throw new AgentParseError(
      `天数不匹配：期望 ${expectedDays} 天，实际 ${rawDays.length} 天`
    );
  }

  const days: ItineraryDay[] = rawDays.map((d, i) => {
    const day = (d ?? {}) as Record<string, unknown>;
    const rawItems = Array.isArray(day.items) ? day.items : [];
    const items = rawItems.map((it) => {
      const item = (it ?? {}) as Record<string, unknown>;
      const cat = str(item.category);
      return {
        time: str(item.time, "--:--"),
        title: str(item.title, "未命名安排"),
        category: CATEGORIES.includes(cat as ItemCategory)
          ? (cat as ItemCategory)
          : "休闲",
        cost: Math.max(0, Math.round(num(item.cost))),
        note: typeof item.note === "string" ? item.note : undefined,
      };
    });
    if (items.length === 0) {
      throw new AgentParseError(`第 ${i + 1} 天没有任何行程条目`);
    }
    return {
      dayIndex: i + 1, // 以序号兜底，避免模型漏写/跳号
      title: str(day.title, `第 ${i + 1} 天`),
      summary: str(day.summary),
      dayBudget: Math.max(0, Math.round(num(day.dayBudget))),
      items,
    };
  });

  const rawBreakdown = Array.isArray(root.budgetBreakdown)
    ? root.budgetBreakdown
    : [];
  const budgetBreakdown = rawBreakdown
    .map((b) => {
      const slice = (b ?? {}) as Record<string, unknown>;
      return { category: str(slice.category, "其他"), amount: Math.max(0, Math.round(num(slice.amount))) };
    })
    .filter((b) => b.amount > 0);

  const tips = (Array.isArray(root.tips) ? root.tips : [])
    .map((t) => str(t))
    .filter(Boolean);

  return {
    tagline: str(root.tagline, "精心编排的旅行计划"),
    days,
    budgetBreakdown,
    tips,
  };
}
