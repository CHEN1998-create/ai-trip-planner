/**
 * GET /api/admin/planner-runs —— 管理后台聚合数据（指标/热门目的地/任务日志/反馈）
 * 数据由 admin_dashboard() SECURITY DEFINER RPC 聚合，非管理员调用返回 403
 */
import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const daysParam = Number(new URL(req.url).searchParams.get("days") ?? 7);
  const days = daysParam === 30 ? 30 : 7;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_dashboard", { p_days: days });

  if (error) {
    if (error.code === "42501") {
      return NextResponse.json(
        { error: "无管理员权限（admin_emails 白名单未包含当前账号）" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: `后台数据查询失败：${error.message}` },
      { status: 500 }
    );
  }
  return NextResponse.json(data);
}
