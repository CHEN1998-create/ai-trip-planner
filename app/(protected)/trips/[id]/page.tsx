"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import ItineraryView from "@/components/ItineraryView";
import BudgetBreakdown from "@/components/BudgetBreakdown";
import FeedbackCard from "@/components/FeedbackCard";
import { formatCNY, paceLabel, statusMeta, type Trip } from "@/lib/mock";
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

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetch(`/api/trips/${id}`).then(async (res) => {
      if (res.status === 401) {
        router.replace(`/login?redirect=/trips/${id}`);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!alive) return;
      if (!res.ok) {
        setLoadError(data.error ?? "行程详情加载失败");
        return;
      }
      setTrip(data.trip);
    });
    return () => {
      alive = false;
    };
  }, [id, router]);

  async function handleRegenerate() {
    if (regenerating || !id) return;
    setRegenerating(true);
    setRegenError(null);
    try {
      const res = await fetch(`/api/trips/${id}/regenerate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.tripId) {
        router.push(`/trips/${data.tripId}`);
        return;
      }
      setRegenError(data.error ?? "重新生成失败，请稍后重试");
    } catch {
      setRegenError("网络异常，请稍后重试");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleExport() {
    if (exporting || !id) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/trips/${id}/export`, { method: "POST" });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${trip?.destination ?? "行程"}-${trip?.dayCount ?? ""}日行程.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setTrip((t) => (t ? { ...t, status: "exported" } : t));
    } finally {
      setExporting(false);
    }
  }

  // 加载中骨架
  if (!trip && !loadError) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-40 animate-pulse rounded-3xl bg-slate-100/70" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-slate-100/70 lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl bg-slate-100/70" />
          </div>
        </main>
      </div>
    );
  }

  // 不存在 / 无权
  if (!trip) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto grid max-w-lg place-items-center px-4 py-28 text-center">
          <AlertTriangle width={40} height={40} className="text-amber-400" />
          <h1 className="mt-4 text-xl font-bold">{loadError ?? "行程不存在"}</h1>
          <Link
            href="/history"
            className="mt-5 rounded-xl gradient-brand px-5 py-2.5 text-sm font-medium text-white"
          >
            返回行程库
          </Link>
        </main>
      </div>
    );
  }

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
                  <span key={p} className="chip bg-white/20 text-white backdrop-blur">
                    {p}
                  </span>
                ))}
                <span className="chip bg-black/20 text-white">{status.label}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Refresh width={15} height={15} className={regenerating ? "animate-spin" : ""} />
                {regenerating ? "Agent 生成中…" : "按原条件重新生成"}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download width={15} height={15} />
                  {exporting ? "导出中…" : "导出"}
                </button>
                <button
                  onClick={handleExport}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/30 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10"
                >
                  <FileText width={15} height={15} />
                  Markdown
                </button>
              </div>
              {regenError && (
                <p className="max-w-[220px] rounded-lg bg-rose-500/20 px-3 py-2 text-xs leading-5 text-white">
                  {regenError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 主体 */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* 左：每日行程 */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Day by Day 行程</h2>
              <span className="text-xs text-ink-mute">
                共 {trip.itinerary?.reduce((n, d) => n + d.items.length, 0) ?? 0} 个安排
              </span>
            </div>

            {hasItinerary ? (
              <ItineraryView days={trip.itinerary!} />
            ) : (
              <div className="card grid place-items-center gap-3 p-12 text-center">
                <AlertTriangle width={36} height={36} className="text-amber-400" />
                <div>
                  <p className="font-semibold">该行程暂无明细数据</p>
                  <p className="mt-1 text-sm text-ink-mute">
                    可使用原始需求重新运行 Agent，生成结果会另存为新行程。
                  </p>
                </div>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-xl gradient-brand px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  <Refresh width={15} height={15} />
                  重新生成
                </button>
              </div>
            )}
          </div>

          {/* 右：预算 / 贴士 / 反馈 */}
          <aside className="space-y-5 self-start lg:sticky lg:top-20">
            {trip.budgetBreakdown && trip.budgetBreakdown.length > 0 && (
              <div className="card p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Wallet width={16} height={16} className="text-brand-500" />
                  预算拆分
                </h3>
                <BudgetBreakdown slices={trip.budgetBreakdown} total={trip.budget} />
              </div>
            )}

            {trip.tips && trip.tips.length > 0 && (
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

            <FeedbackCard tripId={trip.id} />
          </aside>
        </div>
      </main>
    </div>
  );
}
