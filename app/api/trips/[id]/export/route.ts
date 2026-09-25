/**
 * POST /api/trips/:id/export —— 导出行程为 Markdown 文件下载，并记录导出状态
 */
import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { loadTripDetail } from "@/lib/trip-mapper";
import { paceLabel, formatCNY } from "@/lib/mock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toMarkdown(trip: NonNullable<Awaited<ReturnType<typeof loadTripDetail>>["trip"]>): string {
  const lines: string[] = [];
  lines.push(`# ${trip.destination} · ${trip.dayCount} 日行程`);
  lines.push("");
  lines.push(`> ${trip.tagline}`);
  lines.push("");
  lines.push(`- **出发地**：${trip.origin}`);
  lines.push(`- **日期**：${trip.startDate} ~ ${trip.endDate}（${trip.dayCount} 天）`);
  lines.push(`- **人均预算**：${formatCNY(trip.budget)}`);
  lines.push(`- **旅行节奏**：${paceLabel[trip.pace]}`);
  if (trip.preferences.length) {
    lines.push(`- **兴趣偏好**：${trip.preferences.join("、")}`);
  }
  lines.push("");

  for (const day of trip.itinerary ?? []) {
    lines.push(`## D${day.dayIndex} ${day.title}（日预算 ${formatCNY(day.dayBudget)}）`);
    if (day.summary) {
      lines.push("");
      lines.push(`_${day.summary}_`);
    }
    lines.push("");
    for (const item of day.items) {
      const cost = (item.cost ?? 0) > 0 ? ` ¥${item.cost}` : " 免费";
      const note = item.note ? ` — ${item.note}` : "";
      lines.push(`- **${item.time}** ${item.title}（${item.category}）${cost}${note}`);
    }
    lines.push("");
  }

  if (trip.budgetBreakdown?.length) {
    const total = trip.budgetBreakdown.reduce((s, b) => s + b.amount, 0) || 1;
    lines.push(`## 预算拆分（合计 ${formatCNY(total)}）`);
    lines.push("");
    for (const b of trip.budgetBreakdown) {
      lines.push(
        `- ${b.category}：¥${b.amount.toLocaleString("zh-CN")}（${Math.round((b.amount / total) * 100)}%）`
      );
    }
    lines.push("");
  }

  if (trip.tips?.length) {
    lines.push("## 出行建议");
    lines.push("");
    trip.tips.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
    lines.push("");
  }

  lines.push("---");
  lines.push(`由智能旅游规划 Agent 平台生成 · ${new Date().toLocaleString("zh-CN")}`);
  return lines.join("\n");
}

export async function POST(
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

  const markdown = toMarkdown(trip);

  // 记录导出状态（PRD 指标：导出次数）
  await supabase
    .from("trip_plans")
    .update({ status: "exported", exported_at: new Date().toISOString() })
    .eq("id", trip.id);

  const filename = `${trip.destination}-${trip.dayCount}日行程.md`;
  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
