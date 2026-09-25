import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import ItineraryView from "@/components/ItineraryView";
import BudgetBreakdown from "@/components/BudgetBreakdown";
import FeedbackCard from "@/components/FeedbackCard";
import { getTrip, paceLabel, statusMeta, formatCNY } from "@/lib/mock";
import {
  ChevronRight,
  Calendar,
  MapPin,
  Wallet,
  Refresh,
  Download,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from "@/components/icons";

export default function TripDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const trip = getTrip(params.id);
  const status = statusMeta[trip.status];
  const hasItinerary = Boolean(trip.itinerary?.length);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 面包屑 */}
        <nav className="flex items-center gap-1 text-xs text-ink-mute">
          <Link href="/history" className="hover:text-brand-600">
            历史行程
          </Link>
          <ChevronRight width={12} height={12} />
          <span className="text-ink-soft">{trip.destination}</span>
        </nav>

        {/* 行程头图 */}
        <section
          className={`relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br ${trip.cover} p-7 text-white shadow-lift`}
        >
          <div className="hero-grid absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl drop-shadow">{trip.emoji}</span>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {trip.destination} · {trip.dayCount} 日慢游
                  </h1>
                  <p className="mt-1 text-sm text-white/85">{trip.tagline}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
                <span className="flex items-center gap-1.5">
                  <MapPin width={15} height={15} />
                  {trip.origin} 出发
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar width={15} height={15} />
                  {trip.startDate} ~ {trip.endDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Wallet width={15} height={15} />
                  {formatCNY(trip.budget)} / 人
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock width={15} height={15} />
                  节奏 · {paceLabel[trip.pace]}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {trip.preferences.map((p) => (
                  <span
                    key={p}
                    className="chip bg-white/20 text-white backdrop-blur"
                  >
                    {p}
                  </span>
                ))}
                <span className="chip bg-black/20 text-white">
                  {status.label}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-white/25">
                <Refresh width={15} height={15} />
                重新生成
              </button>
              <div className="flex gap-2">
                <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-indigo-50">
                  <Download width={15} height={15} />
                  PDF
                </button>
                <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/30 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10">
                  <FileText width={15} height={15} />
                  文本
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 主体 */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* 左：每日行程 */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">
                Day by Day 行程
              </h2>
              <span className="text-xs text-ink-mute">
                共 {trip.itinerary?.reduce((n, d) => n + d.items.length, 0) ?? 0}{" "}
                个安排
              </span>
            </div>

            {hasItinerary ? (
              <ItineraryView days={trip.itinerary!} />
            ) : (
              <div className="card grid place-items-center gap-3 p-12 text-center">
                <AlertTriangle width={36} height={36} className="text-amber-400" />
                <div>
                  <p className="font-semibold">
                    {trip.status === "failed"
                      ? "该行程生成失败"
                      : "该草稿尚未生成完整行程"}
                  </p>
                  <p className="mt-1 text-sm text-ink-mute">
                    使用原始需求重新运行 Agent，失败任务会在管理后台留痕。
                  </p>
                </div>
                <button className="mt-2 inline-flex items-center gap-1.5 rounded-xl gradient-brand px-5 py-2.5 text-sm font-medium text-white">
                  <Refresh width={15} height={15} />
                  重新生成
                </button>
              </div>
            )}
          </div>

          {/* 右：预算 / 贴士 / 反馈 */}
          <aside className="space-y-5 self-start lg:sticky lg:top-20">
            {trip.budgetBreakdown && (
              <div className="card p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Wallet width={16} height={16} className="text-brand-500" />
                  预算拆分
                </h3>
                <BudgetBreakdown
                  slices={trip.budgetBreakdown}
                  total={trip.budget}
                />
              </div>
            )}

            {trip.tips && (
              <div className="card p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck width={16} height={16} className="text-emerald-500" />
                  注意事项
                </h3>
                <ul className="space-y-2.5">
                  {trip.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] leading-6 text-ink-soft">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <FeedbackCard />
          </aside>
        </div>
      </main>
    </div>
  );
}
