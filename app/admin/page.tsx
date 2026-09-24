import SiteHeader from "@/components/SiteHeader";
import {
  adminMetrics,
  hotDestinations,
  ratingDistribution,
  plannerRuns,
  feedbackList,
  type AdminMetric,
} from "@/lib/mock";
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

const iconMap = {
  chart: BarChart,
  check: CheckCircle,
  clock: Clock,
  alert: AlertTriangle,
} as const;

const iconTone: Record<AdminMetric["icon"], string> = {
  chart: "bg-indigo-50 text-indigo-600",
  check: "bg-emerald-50 text-emerald-600",
  clock: "bg-cyan-50 text-cyan-600",
  alert: "bg-rose-50 text-rose-600",
};

const feedbackStatus = {
  open: { label: "未处理", cls: "bg-rose-50 text-rose-600" },
  viewed: { label: "已查看", cls: "bg-amber-50 text-amber-600" },
  closed: { label: "已关闭", cls: "bg-slate-100 text-slate-500" },
} as const;

export default function AdminPage() {
  const maxCount = Math.max(...hotDestinations.map((d) => d.count));
  const avgScore =
    feedbackList.reduce((s, f) => s + f.score, 0) / feedbackList.length;

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
            {["今日", "近 7 天", "近 30 天"].map((t, i) => (
              <span
                key={t}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  i === 1
                    ? "bg-ink text-white"
                    : "bg-white text-ink-mute ring-1 ring-slate-200"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 指标卡 */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminMetrics.map((m) => {
            const Icon = iconMap[m.icon];
            return (
              <div key={m.label} className="card p-5">
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${iconTone[m.icon]}`}
                  >
                    <Icon width={18} height={18} />
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      m.trend === "up" ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {m.delta}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight">
                  {m.value}
                </p>
                <p className="mt-0.5 text-xs text-ink-mute">{m.label}</p>
              </div>
            );
          })}
        </div>

        {/* 热门目的地 + 评分分布 */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <BarChart width={16} height={16} className="text-brand-500" />
              热门目的地排行
            </h2>
            <ul className="mt-5 space-y-3.5">
              {hotDestinations.map((d, i) => (
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
                      style={{ width: `${(d.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-ink-mute">
                    {d.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-5">
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Star width={16} height={16} className="text-amber-400" />
                用户反馈评分分布
              </h2>
              <div className="mt-4 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{avgScore.toFixed(1)}</p>
                  <div className="mt-1 flex justify-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} width={13} height={13} />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-ink-mute">
                    基于 {feedbackList.length} 条样本
                  </p>
                </div>
                <ul className="flex-1 space-y-1.5">
                  {ratingDistribution.map((r) => (
                    <li key={r.star} className="flex items-center gap-2 text-xs">
                      <span className="flex w-8 items-center gap-0.5 text-slate-500">
                        {r.star}
                        <Star width={10} height={10} className="text-amber-400" />
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${r.pct}%` }}
                        />
                      </div>
                      <span className="w-9 text-right text-slate-400">
                        {r.pct}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card flex items-center gap-4 p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <Download width={22} height={22} />
              </span>
              <div className="flex-1">
                <p className="text-xl font-bold">318</p>
                <p className="text-xs text-ink-mute">近 7 天行程导出次数</p>
              </div>
              <span className="text-xs font-medium text-emerald-500">
                +18.2%
              </span>
            </div>
          </div>
        </div>

        {/* 生成任务日志 */}
        <div className="card mt-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Refresh width={16} height={16} className="text-brand-500" />
              规划任务日志（planner_runs）
            </h2>
            <span className="text-xs text-ink-mute">失败任务可重试</span>
          </div>
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-ink-mute">
                  <th className="px-6 py-3 font-medium">Run ID</th>
                  <th className="px-4 py-3 font-medium">目的地</th>
                  <th className="px-4 py-3 font-medium">模型</th>
                  <th className="px-4 py-3 font-medium">耗时</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">错误信息</th>
                  <th className="px-6 py-3 font-medium">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {plannerRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                      {run.id}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{run.destination}</td>
                    <td className="px-4 py-3.5 text-xs text-ink-mute">
                      {run.provider}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-mute">
                      {(run.latencyMs / 1000).toFixed(1)}s
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
                          run.error ? "text-rose-500" : "text-slate-300"
                        }`}
                        title={run.error}
                      >
                        {run.error ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-400">
                      {run.createdAt}
                    </td>
                  </tr>
                ))}
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
              {feedbackList.filter((f) => f.status === "open").length} 条待处理
            </span>
          </div>
          <ul className="divide-y divide-slate-50">
            {feedbackList.map((f, i) => (
              <li
                key={i}
                className="flex flex-wrap items-start gap-4 px-6 py-4 hover:bg-slate-50/60"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-cyan-400 text-xs font-bold text-white">
                  {f.user[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{f.user}</span>
                    <span className="text-xs text-slate-400">
                      {f.destination} · {f.createdAt}
                    </span>
                    <span
                      className={`chip ${feedbackStatus[f.status].cls}`}
                    >
                      {feedbackStatus[f.status].label}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-6 text-ink-soft">
                    {f.comment}
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
          </ul>
        </div>

        {/* 监控提示 */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "模型调用成功率", value: "96.1%" },
            { label: "外部信息源失败率", value: "2.4%" },
            { label: "平均任务重试次数", value: "0.3" },
            { label: "数据库平均存取", value: "42ms" },
          ].map((x) => (
            <div key={x.label} className="card flex items-center justify-between p-4">
              <span className="text-xs text-ink-mute">{x.label}</span>
              <span className="text-sm font-bold">{x.value}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
