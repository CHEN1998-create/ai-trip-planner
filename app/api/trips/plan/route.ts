/**
 * POST /api/trips/plan —— 创建规划任务
 * 链路：鉴权 → 服务端硬校验 → Agent 编排（LLM→解析，失败降级）→ 落库 → planner_runs 日志
 */
import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { runPlanner } from "@/lib/agent/run";
import { dayDiff } from "@/lib/agent/prompt";
import { saveTrip, logPlannerRun } from "@/lib/agent/persist";
import type { Pace, PlanRequest, PlanResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PACES: Pace[] = ["relaxed", "standard", "compact"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  // 用本地时间分量比对，避免 toISOString 受时区偏移影响
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}

/** 服务端硬校验（PRD：单目的地、3-7 天） */
function validate(body: unknown):
  | { ok: true; value: PlanRequest; dayCount: number }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "请求体必须是 JSON 对象" };
  }
  const b = body as Record<string, unknown>;

  const origin = typeof b.origin === "string" ? b.origin.trim() : "";
  const destination =
    typeof b.destination === "string" ? b.destination.trim() : "";
  const startDate = typeof b.startDate === "string" ? b.startDate : "";
  const endDate = typeof b.endDate === "string" ? b.endDate : "";
  const budget = Number(b.budget);
  const pace = b.pace as Pace;
  const preferences = Array.isArray(b.preferences)
    ? [...new Set(b.preferences.filter((p): p is string => typeof p === "string"))].slice(0, 8)
    : [];

  if (!origin) return { ok: false, error: "出发地不能为空" };
  if (!destination) return { ok: false, error: "目的地不能为空" };
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { ok: false, error: "日期格式无效，需为 YYYY-MM-DD" };
  }
  const dayCount = dayDiff(startDate, endDate);
  if (dayCount < 1) return { ok: false, error: "结束日期不能早于开始日期" };
  if (dayCount < 3 || dayCount > 7) {
    return { ok: false, error: `行程天数需为 3-7 天（当前 ${dayCount} 天）` };
  }
  if (!Number.isFinite(budget) || budget < 100 || budget > 100_000) {
    return { ok: false, error: "人均预算需在 100-100000 元之间" };
  }
  if (!PACES.includes(pace)) {
    return { ok: false, error: "旅行节奏取值无效" };
  }

  return {
    ok: true,
    dayCount,
    value: { origin, destination, startDate, endDate, budget, preferences, pace },
  };
}

export async function POST(req: Request) {
  // 1) 鉴权
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录后再发起规划" }, { status: 401 });
  }

  // 2) 参数校验
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }
  const parsed = validate(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const input = parsed.value;

  // 3) Agent 编排：调模型 → 解析（内部含重试与降级）
  const outcome = await runPlanner(input);

  // 4) 落库：trip_plans → itinerary_days → itinerary_items（失败时不建单）
  const supabase = await createClient();
  let tripId: string | null = null;
  let dbError: string | null = null;

  if (outcome.result) {
    const saved = await saveTrip(supabase, user.id, input, outcome.result);
    tripId = saved.tripId;
    dbError = saved.error;
  }

  // 5) planner_runs 日志（成功/降级/失败均记录，供管理后台统计）
  await logPlannerRun(
    supabase,
    tripId,
    outcome.provider,
    outcome.latencyMs,
    outcome.status === "failed" ? "failed" : "success",
    outcome.degradedReason ?? outcome.error ?? dbError
  );

  // 6) 组装响应
  if (outcome.status === "failed" || dbError) {
    const error = dbError ?? outcome.error ?? "规划任务失败，请重试";
    const payload: PlanResponse = {
      tripId,
      status: "failed",
      provider: outcome.provider,
      latencyMs: outcome.latencyMs,
      request: input,
      result: null,
      error,
    };
    return NextResponse.json(payload, { status: 502 });
  }

  const payload: PlanResponse = {
    tripId,
    status: outcome.status,
    degradedReason: outcome.degradedReason,
    provider: outcome.provider,
    latencyMs: outcome.latencyMs,
    request: input,
    result: outcome.result,
  };
  return NextResponse.json(payload);
}
