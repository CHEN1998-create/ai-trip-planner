/**
 * GET /api/history —— 当前用户的历史行程列表（RLS 自动隔离）
 */
import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { rowToTrip, type TripPlanRow } from "@/lib/trip-mapper";
import type { Trip } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_plans")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: `行程列表查询失败：${error.message}` },
      { status: 500 }
    );
  }

  const trips: Trip[] = (data ?? []).map((r) => rowToTrip(r as unknown as TripPlanRow));
  return NextResponse.json({ trips });
}
