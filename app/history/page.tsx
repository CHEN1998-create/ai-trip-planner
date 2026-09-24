"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import TripCard from "@/components/TripCard";
import { historyTrips, type TripStatus } from "@/lib/mock";
import { Search, Sparkles, Layers, MapPin, Wallet } from "@/components/icons";

type Filter = "all" | TripStatus;

const tabs: { value: Filter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "saved", label: "已保存" },
  { value: "draft", label: "草稿" },
  { value: "exported", label: "已导出" },
  { value: "failed", label: "生成失败" },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [keyword, setKeyword] = useState("");

  const list = useMemo(() => {
    return historyTrips.filter((t) => {
      const matchTab = filter === "all" || t.status === filter;
      const kw = keyword.trim();
      const matchKw =
        !kw ||
        t.destination.includes(kw) ||
        t.tagline.includes(kw) ||
        t.preferences.some((p) => p.includes(kw));
      return matchTab && matchKw;
    });
  }, [filter, keyword]);

  const totalBudget = historyTrips
    .filter((t) => t.status !== "failed")
    .reduce((sum, t) => sum + t.budget, 0);

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
          {[
            { icon: Layers, label: "累计行程", value: `${historyTrips.length} 份` },
            { icon: MapPin, label: "去过 / 计划城市", value: "6 个" },
            { icon: Wallet, label: "累计预算规划", value: `¥${totalBudget.toLocaleString()}` },
          ].map((s) => (
            <div key={s.label} className="card flex items-center gap-3 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <s.icon width={18} height={18} />
              </span>
              <div>
                <p className="text-xs text-ink-mute">{s.label}</p>
                <p className="text-sm font-bold">{s.value}</p>
              </div>
            </div>
          ))}
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
        {list.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="card mt-6 grid place-items-center gap-3 p-16 text-center">
            <Search width={32} height={32} className="text-slate-300" />
            <p className="text-sm text-ink-mute">
              没有匹配的行程，换个关键词或筛选条件试试。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
