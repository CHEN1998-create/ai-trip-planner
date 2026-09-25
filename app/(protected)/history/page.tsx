"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import TripCard from "@/components/TripCard";
import { type Trip } from "@/lib/mock";
import { Search, Sparkles, Layers, MapPin, Wallet } from "@/components/icons";

type Filter = "all" | Trip["status"];

const tabs: { value: Filter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "saved", label: "已保存" },
  { value: "draft", label: "草稿" },
  { value: "exported", label: "已导出" },
  { value: "failed", label: "生成失败" },
];

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: string;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon width={18} height={18} />
      </span>
      <div>
        <p className="text-xs text-ink-mute">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/history").then(async (res) => {
      if (res.status === 401) {
        router.replace("/login?redirect=/history");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!alive) return;
      if (!res.ok) {
        setError(data.error ?? "行程列表加载失败");
        setTrips([]);
        return;
      }
      setTrips(data.trips ?? []);
    });
    return () => {
      alive = false;
    };
  }, [router]);

  const list = useMemo(() => {
    if (!trips) return [];
    return trips.filter((t) => {
      const matchTab = filter === "all" || t.status === filter;
      const kw = keyword.trim();
      const matchKw =
        !kw ||
        t.destination.includes(kw) ||
        t.tagline.includes(kw) ||
        t.preferences.some((p) => p.includes(kw));
      return matchTab && matchKw;
    });
  }, [trips, filter, keyword]);

  const cityCount = trips
    ? new Set(trips.map((t) => t.destination)).size
    : 0;
  const totalBudget =
    trips?.filter((t) => t.status !== "failed").reduce((s, t) => s + t.budget, 0) ?? 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页头 */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Layers className="text-brand-500" width={22} height={22} />
              我的行程库
            </h1>
            <p className="mt-1 text-sm text-ink-mute">
              历史计划自动保存，可随时重新打开、二次生成或导出
            </p>
          </div>
          <Link
            href="/planner"
            className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-4 py-2.5 text-sm font-medium text-white shadow-lift transition hover:shadow-glow"
          >
            <Sparkles width={15} height={15} />
            新建行程
          </Link>
        </div>

        {/* 统计条 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <StatCard icon={Layers} label="累计行程" value={trips ? `${trips.length} 份` : "—"} />
          <StatCard icon={MapPin} label="计划城市" value={trips ? `${cityCount} 个` : "—"} />
          <StatCard
            icon={Wallet}
            label="累计预算规划"
            value={trips ? `¥${totalBudget.toLocaleString()}` : "—"}
          />
        </div>

        {/* 搜索 + 筛选 */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition ${
                  filter === tab.value
                    ? "bg-ink text-white"
                    : "bg-white text-ink-mute ring-1 ring-slate-200 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search
              width={15}
              height={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索目的地 / 偏好"
              className="field-input pl-9"
            />
          </div>
        </div>

        {/* 列表 */}
        {trips === null ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-64 animate-pulse bg-slate-100/60" />
            ))}
          </div>
        ) : list.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="card mt-6 grid place-items-center gap-3 p-16 text-center">
            <Search width={32} height={32} className="text-slate-300" />
            <p className="text-sm text-ink-mute">
              {error
                ? error
                : filter === "failed"
                ? "暂无失败任务。生成失败的任务会记录在管理后台的规划日志中。"
                : "没有匹配的行程，换个关键词或筛选条件试试。"}
            </p>
            {filter === "all" && trips.length === 0 && !error && (
              <Link
                href="/planner"
                className="rounded-xl gradient-brand px-5 py-2.5 text-sm font-medium text-white"
              >
                去生成第一份行程
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
