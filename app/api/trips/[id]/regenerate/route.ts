/**
 * POST /api/trips/:id/regenerate —— 按原条件重新生成（新建行程，原行程保留）
 */
import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { runPlanner } from "@/lib/agent/run";
import { saveTrip, logPlannerRun } from "@/lib/agent/persist";
import { loadTripDetail } from "@/lib/trip-mapper";
import type { PlanResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const supabase = await createClient();
  const { trip: existing } = await loadTripDetail(supabase, params.id);
  if (!existing) {
    return NextResponse.json({ error: "行程不存在或无权访问" }, { status: 404 });
  }

  // 复用原行程的 7 字段输入，走同一条编排链路（LLM → 解析 → 重试/降级）
  const input = existing.request;
  const outcome = await runPlanner(input);

  let tripId: string | null = null;
  let dbError: string | null = null;
  if (outcome.result) {
    const saved = await saveTrip(supabase, user.id, input, outcome.result);
    tripId = saved.tripId;
    dbError = saved.error;
  }

  await logPlannerRun(
    supabase,
    tripId,
    outcome.provider,
    outcome.latencyMs,
    outcome.status === "failed" ? "failed" : "success",
    outcome.degradedReason ?? outcome.error ?? dbError
  );

  if (outcome.status === "failed" || dbError) {
    const payload: PlanResponse = {
      tripId,
      status: "failed",
      provider: outcome.provider,
      latencyMs: outcome.latencyMs,
      request: input,
      result: null,
      error: dbError ?? outcome.error ?? "重新生成失败，请重试",
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
