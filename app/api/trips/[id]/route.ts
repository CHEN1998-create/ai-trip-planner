/**
 * GET /api/trips/:id —— 行程详情（主表 + 按天 + 条目，RLS 限制仅本人）
 */
import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { loadTripDetail } from "@/lib/trip-mapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const supabase = await createClient();
  const { trip } = await loadTripDetail(supabase, params.id);
  if (!trip) {
    return NextResponse.json({ error: "行程不存在或无权访问" }, { status: 404 });
  }
  return NextResponse.json({ trip });
}
