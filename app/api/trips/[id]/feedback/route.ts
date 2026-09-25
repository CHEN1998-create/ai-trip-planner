/**
 * POST /api/trips/:id/feedback —— 提交行程评分与留言
 */
import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: { score?: unknown; comment?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const score = Number(body.score);
  const comment =
    typeof body.comment === "string" ? body.comment.trim().slice(0, 500) : "";
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return NextResponse.json({ error: "评分需为 1-5 的整数" }, { status: 400 });
  }

  const supabase = await createClient();
  // 先确认行程归属（RLS 兜底）
  const { data: trip } = await supabase
    .from("trip_plans")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();
  if (!trip) {
    return NextResponse.json({ error: "行程不存在或无权访问" }, { status: 404 });
  }

  const { error } = await supabase.from("trip_feedback").insert({
    trip_plan_id: params.id,
    user_id: user.id,
    score,
    comment: comment || null,
  });
  if (error) {
    return NextResponse.json(
      { error: `反馈提交失败：${error.message}` },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
