/**
 * 领域类型 —— 前后端共享的唯一类型源
 * 对应 PRD 数据表：trip_plans / itinerary_days / itinerary_items / planner_runs / trip_feedback
 */

export type TripStatus = "saved" | "draft" | "exported" | "failed";
export type Pace = "relaxed" | "standard" | "compact";

export type ItemCategory = "交通" | "美食" | "景点" | "文化" | "休闲" | "住宿";

export interface ItineraryItem {
  time: string;
  title: string;
  category: ItemCategory;
  cost?: number;
  note?: string;
}

export interface ItineraryDay {
  dayIndex: number;
  title: string;
  summary: string;
  dayBudget: number;
  items: ItineraryItem[];
}

export interface BudgetSlice {
  category: string;
  amount: number;
  /** Tailwind 颜色类（完整类名字符串，供 JIT 扫描） */
  barClass: string;
  textClass: string;
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  tagline: string;
  startDate: string;
  endDate: string;
  dayCount: number;
  budget: number;
  preferences: string[];
  pace: Pace;
  status: TripStatus;
  cover: string; // 渐变类名
  emoji: string;
  createdAt: string;
  itinerary?: ItineraryDay[];
  budgetBreakdown?: BudgetSlice[];
  tips?: string[];
}

/* ---------------- Agent 编排输入 / 输出 ---------------- */

/** POST /api/trips/plan 请求体（与 PRD 8 节一致，共 7 个字段） */
export interface PlanRequest {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  preferences: string[];
  pace: Pace;
}

/** LLM 结构化输出（budgetBreakdown 只含类别与金额，颜色由前端映射） */
export interface PlanResult {
  tagline: string;
  days: ItineraryDay[];
  budgetBreakdown: { category: string; amount: number }[];
  tips: string[];
}

/** POST /api/trips/plan 响应体 */
export interface PlanResponse {
  tripId: string | null;
  status: "success" | "degraded" | "failed";
  /** degraded 时的人类可读原因（如未配置 LLM key、模型输出解析失败已降级） */
  degradedReason?: string;
  provider: string;
  latencyMs: number;
  request: PlanRequest;
  result: PlanResult | null;
  error?: string;
}

/* ---------------- 管理后台聚合数据（admin_dashboard RPC 返回） ---------------- */

export interface AdminMetrics {
  totalRuns: number;
  successRuns: number;
  failedRuns: number;
  avgLatencyMs: number;
  todayRuns: number;
  exportCount: number;
  totalTrips: number;
}

export interface AdminRunRow {
  id: string;
  destination: string | null;
  provider: string | null;
  latency_ms: number | null;
  status: "success" | "failed";
  error_message: string | null;
  created_at: string;
}

export interface AdminFeedbackRow {
  id: string;
  destination: string;
  user: string;
  score: number;
  comment: string | null;
  created_at: string;
}

export interface AdminDashboardData {
  windowDays: number;
  metrics: AdminMetrics;
  hotDestinations: { name: string; count: number }[];
  ratingDistribution: { star: number; count: number }[];
  runs: AdminRunRow[];
  feedback: AdminFeedbackRow[];
}

/* ---------------- 预算拆分配色（前端映射，避免 LLM 输出 Tailwind 类名） ---------------- */

const BUDGET_COLORS: Record<string, { barClass: string; textClass: string }> = {
  餐饮: { barClass: "bg-amber-400", textClass: "text-amber-500" },
  住宿: { barClass: "bg-indigo-500", textClass: "text-indigo-500" },
  交通: { barClass: "bg-cyan-500", textClass: "text-cyan-500" },
  门票: { barClass: "bg-violet-500", textClass: "text-violet-500" },
  购物: { barClass: "bg-rose-500", textClass: "text-rose-500" },
  娱乐: { barClass: "bg-emerald-500", textClass: "text-emerald-500" },
};

const BUDGET_FALLBACK = [
  { barClass: "bg-lime-400", textClass: "text-lime-500" },
  { barClass: "bg-orange-400", textClass: "text-orange-500" },
  { barClass: "bg-sky-400", textClass: "text-sky-500" },
];

/** 为 LLM 返回的预算拆分补充 Tailwind 配色类 */
export function toBudgetSlices(
  raw: { category: string; amount: number }[]
): BudgetSlice[] {
  let fallbackIdx = 0;
  return raw.map(({ category, amount }) => {
    const color =
      BUDGET_COLORS[category] ??
      BUDGET_FALLBACK[fallbackIdx++ % BUDGET_FALLBACK.length];
    return { category, amount, ...color };
  });
}

/** 行程封面渐变池（按目的地名稳定取色，避免同一目的地每次变色） */
export const TRIP_COVERS = [
  "from-indigo-500 via-violet-500 to-fuchsia-500",
  "from-rose-500 via-orange-400 to-amber-400",
  "from-cyan-500 via-sky-500 to-indigo-500",
  "from-emerald-400 via-teal-400 to-cyan-500",
  "from-sky-400 via-blue-500 to-indigo-600",
  "from-lime-400 via-emerald-400 to-teal-500",
];

export const TRIP_EMOJIS = [
  "🐼", "🏯", "🌶️", "🌊", "🏔️", "🍃", "🍜", "🎡", "🏖️", "⛩️",
];

/** 按字符串内容稳定选取封面与 emoji */
export function coverFor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TRIP_COVERS[h % TRIP_COVERS.length];
}

export function emojiFor(name: string): string {
  let h = 7;
  for (const ch of name) h = (h * 17 + ch.charCodeAt(0)) >>> 0;
  return TRIP_EMOJIS[h % TRIP_EMOJIS.length];
}
