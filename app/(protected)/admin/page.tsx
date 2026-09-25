"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import type { AdminDashboardData } from "@/lib/types";
import {
  BarChart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Download,
  Message,
  Refresh,
} from "@/components/icons";

const feedbackStatus: Record<number, { label: string; cls: string }> = {
  5: { label: "好评", cls: "bg-emerald-50 text-emerald-600" },
  4: { label: "好评", cls: "bg-emerald-50 text-emerald-600" },
  3: { label: "中评", cls: "bg-amber-50 text-amber-600" },
  2: { label: "差评", cls: "bg-rose-50 text-rose-600" },
  1: { label: "差评", cls: "bg-rose-50 text-rose-600" },
};

const metricTone = [
  "bg-indigo-50 text-indigo-600",
  "bg-emerald-50 text-emerald-600",
  "bg-cyan-50 text-cyan-600",
  "bg-rose-50 text-rose-600",
];

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [days, setDays] = useState<7 | 30>(7);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    fetch(`/api/admin/planner-runs?days=${days}`).then(async (res) => {
      const payload = await res.json().catch(() => ({}));
      if (!alive) return;
      if (!res.ok) {
        setError(payload.error ?? "后台数据加载失败");
        return;
      }
      setError(null);
      setData(payload as AdminDashboardData);
    });
    return () => {
      alive = false;
    };
  }, [days]);

  const m = data?.metrics;
  const successRate =
    m && m.totalRuns > 0 ? Math.round((m.successRuns / m.totalRuns) * 100) : null;

  const metricCards = [
    { icon: BarChart, label: `近 ${days} 天规划任务数`, value: m ? `${m.totalRuns}` : "—" },
    {
      icon: CheckCircle,
      label: "规划成功率",
      value: successRate === null ? "—" : `${successRate}%`,
    },
    {
      icon: Clock,
      label: "平均生成耗时",
      value: m ? `${(m.avgLatencyMs / 1000).toFixed(1)}s` : "—",
    },
    { icon: AlertTriangle, label: `失败任务（近 ${days} 天）`, value: m ? `${m.failedRuns}` : "—" },
  ];

  const maxHot = Math.max(1, ...(data?.hotDestinations ?? []).map((d) => d.count));
  const totalRatings =
    data?.ratingDistribution.reduce((s, r) => s + r.count, 0) ?? 0;
  const avgScore =
    totalRatings > 0 && data
      ? data.ratingDistribution.reduce((s, r) => s + r.star * r.count, 0) / totalRatings
      : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页头 */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <BarChart className="text-brand-500" width={22} height={22} />
              运营与任务中心
            </h1>
            <p className="mt-1 text-sm text-ink-mute">
              关注热门目的地、任务健康度与用户反馈，而不只是系统日志
            </p>
          </div>
          <div className="flex gap-1.5">
            {([7, 30] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  days === d
                    ? "bg-ink text-white"
                    : "bg-white text-ink-mute ring-1 ring-slate-200 hover:text-ink"
                }`}
              >
                近 {d} 天
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="card mt-6 border-l-4 border-rose-400 p-5 text-sm text-rose-600">
            {error}
          </div>
        )}

        {/* 指标卡 */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((card, i) => (
            <div key={card.label} className="card p-5">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${metricTone[i]}`}
              >
                <card.icon width={18} height={18} />
              </span>
              <p className="mt-4 text-2xl font-bold tracking-tight">{card.value}</p>
              <p className="mt-0.5 text-xs text-ink-mute">{card.label}</p>
            </div>
          ))}
        </div>

        {/* 热门目的地 + 评分分布 / 导出 */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <BarChart width={16} height={16} className="text-brand-500" />
              热门目的地排行
            </h2>
            {data && data.hotDestinations.length > 0 ? (
              <ul className="mt-5 space-y-3.5">
                {data.hotDestinations.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-3">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-md text-[11px] font-bold ${
                        i < 3
                          ? "gradient-brand text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="w-10 text-sm font-medium">{d.name}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
                        style={{ width: `${(d.count / maxHot) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-ink-mute">
                      {d.count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-ink-mute">
                {data ? "暂无行程数据" : "加载中…"}
              </p>
            )}
          </div>

          <div className="grid gap-5">
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Star width={16} height={16} className="text-amber-400" />
                用户反馈评分分布
              </h2>
              <div className="mt-4 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    {avgScore === null ? "—" : avgScore.toFixed(1)}
                  </p>
                  <div className="mt-1 flex justify-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} width={13} height={13} />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-ink-mute">
                    基于 {totalRatings} 条样本
                  </p>
                </div>
                <ul className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const row = data?.ratingDistribution.find((r) => r.star === star);
                    const pct =
                      row && totalRatings > 0
                        ? Math.round((row.count / totalRatings) * 100)
                        : 0;
                    return (
                      <li key={star} className="flex items-center gap-2 text-xs">
                        <span className="flex w-8 items-center gap-0.5 text-slate-500">
                          {star}
                          <Star width={10} height={10} className="text-amber-400" />
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-slate-400">{pct}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="card flex items-center gap-4 p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <Download width={22} height={22} />
              </span>
              <div className="flex-1">
                <p className="text-xl font-bold">{m ? m.exportCount : "—"}</p>
                <p className="text-xs text-ink-mute">
                  近 {days} 天行程导出次数
                </p>
              </div>
              <span className="text-xs text-ink-mute">
                累计行程 {m ? m.totalTrips : "—"} 份
              </span>
            </div>
          </div>
        </div>

        {/* 生成任务日志（含失败任务） */}
        <div className="card mt-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Refresh width={16} height={16} className="text-brand-500" />
              规划任务日志（planner_runs）
            </h2>
            <span className="chip bg-rose-50 text-rose-600">
              {data ? `${m?.failedRuns ?? 0} 条失败` : "…"}
            </span>
          </div>
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-ink-mute">
                  <th className="px-6 py-3 font-medium">Run ID</th>
                  <th className="px-4 py-3 font-medium">目的地</th>
                  <th className="px-4 py-3 font-medium">提供方</th>
                  <th className="px-4 py-3 font-medium">耗时</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">错误信息</th>
                  <th className="px-6 py-3 font-medium">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(data?.runs ?? []).map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                      {run.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3.5 font-medium">
                      {run.destination ?? "（未成单）"}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-mute">
                      {run.provider ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-mute">
                      {run.latency_ms != null
                        ? `${(run.latency_ms / 1000).toFixed(1)}s`
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      {run.status === "success" ? (
                        <span className="chip bg-emerald-50 text-emerald-600">
                          <CheckCircle width={12} height={12} />
                          成功
                        </span>
                      ) : (
                        <span className="chip bg-rose-50 text-rose-600">
                          <AlertTriangle width={12} height={12} />
                          失败
                        </span>
                      )}
                    </td>
                    <td className="max-w-[260px] px-4 py-3.5">
                      <span
                        className={`truncate text-xs ${
                          run.error_message ? "text-rose-500" : "text-slate-300"
                        }`}
                        title={run.error_message ?? undefined}
                      >
                        {run.error_message ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-400">
                      {fmtTime(run.created_at)}
                    </td>
                  </tr>
                ))}
                {data && data.runs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-ink-mute">
                      近 {days} 天暂无规划任务
                    </td>
                  </tr>
                )}
                {!data && !error && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-ink-mute">
                      加载中…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 用户反馈 */}
        <div className="card mt-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Message width={16} height={16} className="text-brand-500" />
              用户反馈（trip_feedback）
            </h2>
            <span className="chip bg-rose-50 text-rose-600">
              {(data?.feedback ?? []).filter((f) => f.score <= 2).length} 条差评
            </span>
          </div>
          <ul className="divide-y divide-slate-50">
            {(data?.feedback ?? []).map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-start gap-4 px-6 py-4 hover:bg-slate-50/60"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-cyan-400 text-xs font-bold text-white">
                  {f.user[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{f.user}</span>
                    <span className="text-xs text-slate-400">
                      {f.destination} · {fmtTime(f.created_at)}
                    </span>
                    <span className={`chip ${feedbackStatus[f.score]?.cls ?? "bg-slate-100 text-slate-500"}`}>
                      {feedbackStatus[f.score]?.label ?? "评价"}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-6 text-ink-soft">
                    {f.comment || "（未留言）"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      width={14}
                      height={14}
                      className={si < f.score ? "" : "text-slate-200"}
                    />
                  ))}
                </div>
              </li>
            ))}
            {data && data.feedback.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-ink-mute">
                暂无用户反馈。用户可在行程详情页底部提交评分与留言。
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
