/**
 * 行程数据映射：DB 行 ↔ 领域对象（服务端专用）
 */
import type { ItineraryDay, PlanRequest, Trip } from "@/lib/types";
import { coverFor, emojiFor, toBudgetSlices } from "@/lib/types";

export interface TripPlanRow {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  preferences: string[];
  pace: PlanRequest["pace"];
  status: Trip["status"];
  tagline: string | null;
  tips: string[];
  budget_breakdown: { category: string; amount: number }[] | null;
  created_at: string;
  exported_at: string | null;
}

export function dayCountOf(startDate: string, endDate: string): number {
  const s = new Date(`${startDate}T00:00:00`).getTime();
  const e = new Date(`${endDate}T00:00:00`).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return 0;
  return Math.max(0, Math.round((e - s) / 86_400_000) + 1);
}

/** DB 行 → Trip 卡片对象（不含 itinerary 明细） */
export function rowToTrip(row: TripPlanRow): Trip {
  return {
    id: row.id,
    origin: row.origin,
    destination: row.destination,
    tagline: row.tagline ?? `${row.destination} ${dayCountOf(row.start_date, row.end_date)} 日行程`,
    startDate: row.start_date,
    endDate: row.end_date,
    dayCount: dayCountOf(row.start_date, row.end_date),
    budget: Number(row.budget),
    preferences: row.preferences ?? [],
    pace: row.pace,
    status: row.status,
    cover: coverFor(row.destination),
    emoji: emojiFor(row.destination),
    createdAt: row.created_at,
    budgetBreakdown: undefined,
    tips: row.tips ?? undefined,
  };
}

export function rowToPlanRequest(row: TripPlanRow): PlanRequest {
  return {
    origin: row.origin,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    budget: Number(row.budget),
    preferences: row.preferences ?? [],
    pace: row.pace,
  };
}

/** 加载完整行程详情（主表 + 按天 + 条目）；不存在或无权返回 null（RLS 隔离） */
export async function loadTripDetail(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  tripId: string
): Promise<{ trip: (Trip & { request: PlanRequest }) | null }> {
  const { data: row, error } = await supabase
    .from("trip_plans")
    .select("*")
    .eq("id", tripId)
    .maybeSingle();
  if (error || !row) return { trip: null };
  const plan = row as unknown as TripPlanRow;

  const { data: dayRows } = await supabase
    .from("itinerary_days")
    .select("id, day_index, title, summary, day_budget")
    .eq("trip_plan_id", tripId)
    .order("day_index");

  const { data: itemRows } = await supabase
    .from("itinerary_items")
    .select("itinerary_day_id, start_time, place_name, category, notes, estimated_cost, sort_index");

  const days: ItineraryDay[] = (dayRows ?? []).map((d, i) => ({
    dayIndex: d.day_index ?? i + 1,
    title: d.title ?? `第 ${d.day_index ?? i + 1} 天`,
    summary: d.summary ?? "",
    dayBudget: Number(d.day_budget ?? 0),
    items: (itemRows ?? [])
      .filter((it) => it.itinerary_day_id === d.id)
      .sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0))
      .map((it) => ({
        time: it.start_time ?? "--:--",
        title: it.place_name ?? "未命名安排",
        category: (it.category ?? "休闲") as ItineraryDay["items"][number]["category"],
        cost: Number(it.estimated_cost ?? 0),
        note: it.notes ?? undefined,
      })),
  }));

  const trip = {
    ...rowToTrip(plan),
    itinerary: days,
    budgetBreakdown: toBudgetSlices(plan.budget_breakdown ?? []),
  };
  return { trip: { ...trip, request: rowToPlanRequest(plan) } };
}
