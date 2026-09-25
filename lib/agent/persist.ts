/**
 * 行程落库：trip_plans → itinerary_days → itinerary_items
 * POST /api/trips/plan 与 POST /api/trips/:id/regenerate 共用
 */
import type { PlanRequest, PlanResult } from "@/lib/types";

export interface SaveTripOutcome {
  tripId: string | null;
  error: string | null;
}

export async function saveTrip(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  input: PlanRequest,
  result: PlanResult
): Promise<SaveTripOutcome> {
  const { data: plan, error: planErr } = await supabase
    .from("trip_plans")
    .insert({
      user_id: userId,
      origin: input.origin,
      destination: input.destination,
      start_date: input.startDate,
      end_date: input.endDate,
      budget: input.budget,
      preferences: input.preferences,
      pace: input.pace,
      status: "saved",
      tagline: result.tagline,
      tips: result.tips,
      budget_breakdown: result.budgetBreakdown,
    })
    .select("id")
    .single();

  if (planErr || !plan) {
    return { tripId: null, error: `行程主表写入失败：${planErr?.message ?? "未知错误"}` };
  }
  const tripId = plan.id as string;

  const { data: insertedDays, error: daysErr } = await supabase
    .from("itinerary_days")
    .insert(
      result.days.map((d) => ({
        trip_plan_id: tripId,
        day_index: d.dayIndex,
        title: d.title,
        summary: d.summary,
        day_budget: d.dayBudget,
      }))
    )
    .select("id, day_index");

  if (daysErr || !insertedDays) {
    return { tripId, error: `行程按天表写入失败：${daysErr?.message ?? "未知错误"}` };
  }

  const itemRows = result.days.flatMap((d) => {
    const dbDay = insertedDays.find((x) => x.day_index === d.dayIndex);
    if (!dbDay) return [];
    return d.items.map((it, idx) => ({
      itinerary_day_id: dbDay.id as string,
      start_time: it.time,
      place_name: it.title,
      category: it.category,
      notes: it.note ?? null,
      estimated_cost: it.cost ?? 0,
      sort_index: idx,
    }));
  });
  if (itemRows.length > 0) {
    const { error: itemsErr } = await supabase
      .from("itinerary_items")
      .insert(itemRows);
    if (itemsErr) {
      return { tripId, error: `行程条目表写入失败：${itemsErr.message}` };
    }
  }

  return { tripId, error: null };
}

/** planner_runs 日志（成功/降级/失败均记录） */
export async function logPlannerRun(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  tripPlanId: string | null,
  provider: string,
  latencyMs: number,
  status: "success" | "failed",
  errorMessage: string | null
): Promise<void> {
  const { error } = await supabase.from("planner_runs").insert({
    trip_plan_id: tripPlanId,
    provider,
    latency_ms: Math.min(latencyMs, 2_147_483_647),
    status,
    error_message: errorMessage,
  });
  if (error) {
    console.error("[planner] planner_runs 写入失败：", error.message);
  }
}
