"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import ItineraryView from "@/components/ItineraryView";
import {
  chengduTrip,
  preferenceOptions,
  paceOptions,
  formatCNY,
  type Pace,
} from "@/lib/mock";
import {
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Check,
  CheckCircle,
  ArrowRight,
  Refresh,
  Route,
  Loading,
} from "@/components/icons";

const STEPS = ["解析旅行需求", "检索目的地 POI", "编排每日行程", "核算预算拆分"];

type Phase = "idle" | "loading" | "done";

export default function PlannerPage() {
  const [origin, setOrigin] = useState("上海");
  const [destination, setDestination] = useState("成都");
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-05-04");
  const [budget, setBudget] = useState(3500);
  const [prefs, setPrefs] = useState<string[]>(["美食", "历史文化"]);
  const [pace, setPace] = useState<Pace>("standard");

  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const togglePref = (p: string) =>
    setPrefs((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const startGeneration = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("loading");
    setStep(0);
    STEPS.forEach((_, i) => {
      const t = setTimeout(() => {
        if (i < STEPS.length - 1) setStep(i + 1);
        else setPhase("done");
      }, 800 * (i + 1));
      timers.current.push(t);
    });
  };

  const requestPayload = JSON.stringify(
    {
      origin,
      destination,
      startDate,
      endDate,
      budget,
      preferences: prefs,
      pace,
    },
    null,
    2
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页头 */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Sparkles className="text-brand-500" width={22} height={22} />
              AI 行程规划台
            </h1>
            <p className="mt-1 text-sm text-ink-mute">
              左侧描述需求，右侧实时预览 Agent 编排结果（当前为 Mock 数据）
            </p>
          </div>
          <span className="chip bg-amber-50 text-amber-600">
            POST /api/trips/plan · 模拟
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* ============ 左侧：需求表单 ============ */}
          <aside className="self-start lg:sticky lg:top-20">
            <div className="card p-5">
              {/* 路线 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">
                    <span className="inline-flex items-center gap-1">
                      <MapPin width={12} height={12} /> 出发地
                    </span>
                  </label>
                  <input
                    className="field-input"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="上海"
                  />
                </div>
                <div>
                  <label className="field-label">
                    <span className="inline-flex items-center gap-1">
                      <MapPin width={12} height={12} /> 目的地
                    </span>
                  </label>
                  <input
                    className="field-input"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="成都"
                  />
                </div>
              </div>

              {/* 日期 */}
              <div className="mt-4">
                <label className="field-label">
                  <span className="inline-flex items-center gap-1">
                    <Calendar width={12} height={12} /> 出行日期（3-7 天）
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="field-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="text-slate-400">~</span>
                  <input
                    type="date"
                    className="field-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* 预算 */}
              <div className="mt-4">
                <label className="field-label">
                  <span className="inline-flex items-center gap-1">
                    <Wallet width={12} height={12} /> 人均预算
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1000}
                    max={8000}
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600"
                  />
                  <span className="w-20 rounded-lg bg-brand-50 py-1.5 text-center text-sm font-semibold text-brand-700">
                    {formatCNY(budget)}
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  {[2000, 3500, 5000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setBudget(v)}
                      className={`rounded-lg px-2.5 py-1 text-xs transition ${
                        budget === v
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-ink-mute hover:bg-slate-200"
                      }`}
                    >
                      {formatCNY(v)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 偏好 */}
              <div className="mt-4">
                <label className="field-label">兴趣偏好（可多选）</label>
                <div className="flex flex-wrap gap-2">
                  {preferenceOptions.map((p) => {
                    const active = prefs.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePref(p)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-white text-ink-mute hover:border-brand-300 hover:text-brand-600"
                        }`}
                      >
                        {active && <Check width={12} height={12} />}
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 节奏 */}
              <div className="mt-4">
                <label className="field-label">
                  <span className="inline-flex items-center gap-1">
                    <Route width={12} height={12} /> 旅行节奏
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {paceOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPace(opt.value)}
                      className={`rounded-xl border px-2 py-2.5 text-center transition ${
                        pace === opt.value
                          ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                          : "border-slate-200 bg-white hover:border-brand-300"
                      }`}
                    >
                      <span
                        className={`block text-sm font-semibold ${
                          pace === opt.value ? "text-brand-700" : "text-ink"
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-ink-mute">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 提交 */}
              <button
                type="button"
                onClick={startGeneration}
                disabled={phase === "loading" || !destination}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-3.5 text-sm font-semibold text-white shadow-lift transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
              >
                {phase === "loading" ? (
                  <>
                    <Loading width={16} height={16} className="animate-spin" />
                    Agent 正在规划…
                  </>
                ) : (
                  <>
                    <Sparkles width={16} height={16} />
                    {phase === "done" ? "重新生成行程" : "生成行程"}
                  </>
                )}
              </button>
              <p className="mt-2.5 text-center text-[11px] text-slate-400">
                MVP 限制：单目的地 · 3-7 天 · 暂不联排多城市
              </p>
            </div>
          </aside>

          {/* ============ 右侧：结果预览 ============ */}
          <section className="card min-h-[640px] overflow-hidden">
            {/* 预览顶栏 */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="ml-2 text-xs text-ink-mute">
                  生成结果预览 · app:/planner
                </span>
              </div>
              {phase === "done" && (
                <span className="chip bg-emerald-50 text-emerald-600">
                  <CheckCircle width={12} height={12} />
                  结构化 JSON 生成成功
                </span>
              )}
            </div>

            <div className="thin-scroll max-h-[calc(100vh-180px)] overflow-y-auto p-5">
              {/* ---- 空状态 ---- */}
              {phase === "idle" && (
                <div className="grid min-h-[560px] place-items-center">
                  <div className="text-center">
                    <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-brand-50">
                      <div className="absolute inset-0 animate-pulse-soft rounded-3xl bg-brand-100/60" />
                      <Route width={36} height={36} className="text-brand-500" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">
                      行程将在这里实时生成
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink-mute">
                      填好左侧的目的地、日期、预算与偏好，点击
                      <span className="font-medium text-brand-600">
                        “生成行程”
                      </span>
                      ，即可看到 Agent 的编排过程与 Day by Day 结果。
                    </p>
                    <div className="mt-6 flex justify-center gap-2 text-[11px] text-slate-400">
                      {STEPS.map((s) => (
                        <span key={s} className="chip bg-slate-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---- 生成中 ---- */}
              {phase === "loading" && (
                <div>
                  <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                    {STEPS.map((s, i) => {
                      const state =
                        i < step ? "done" : i === step ? "doing" : "wait";
                      return (
                        <div key={s} className="flex items-center gap-3 py-2">
                          {state === "done" ? (
                            <CheckCircle
                              width={18}
                              height={18}
                              className="text-emerald-500"
                            />
                          ) : state === "doing" ? (
                            <Loading
                              width={18}
                              height={18}
                              className="animate-spin text-brand-600"
                            />
                          ) : (
                            <span className="h-[18px] w-[18px] rounded-full border-2 border-slate-200" />
                          )}
                          <span
                            className={`text-sm ${
                              state === "wait"
                                ? "text-slate-400"
                                : state === "doing"
                                  ? "font-medium text-brand-700"
                                  : "text-ink-soft"
                            }`}
                          >
                            {s}
                          </span>
                          {state === "doing" && (
                            <span className="ml-auto text-xs text-brand-500">
                              进行中…
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 space-y-4">
                    {[0, 1].map((k) => (
                      <div key={k} className="card p-5">
                        <div className="skeleton h-4 w-32 rounded" />
                        <div className="mt-4 space-y-3">
                          <div className="skeleton h-10 rounded-lg" />
                          <div className="skeleton h-10 rounded-lg" />
                          <div className="skeleton h-10 w-2/3 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---- 生成完成 ---- */}
              {phase === "done" && (
                <div className="animate-fade-up">
                  {/* 结果摘要 */}
                  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${chengduTrip.cover} p-5 text-white`}>
                    <div className="hero-grid absolute inset-0 opacity-50" />
                    <div className="relative flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">
                          {destination} · {chengduTrip.dayCount} 日慢游
                        </h3>
                        <p className="mt-1 text-xs text-white/85">
                          {origin} 出发 · {startDate} ~ {endDate} · 节奏
                          {paceOptions.find((p) => p.value === pace)?.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-white/80">预估总预算</p>
                        <p className="text-2xl font-bold">{formatCNY(budget)}</p>
                      </div>
                    </div>
                    <div className="relative mt-3 flex flex-wrap gap-1.5">
                      {prefs.map((p) => (
                        <span
                          key={p}
                          className="chip bg-white/20 text-white backdrop-blur"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 操作 */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/trips/trip-chengdu"
                      className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-4 py-2.5 text-sm font-medium text-white shadow-lift"
                    >
                      查看完整详情
                      <ArrowRight width={15} height={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={startGeneration}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-slate-50"
                    >
                      <Refresh width={15} height={15} />
                      换一版
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-slate-50"
                    >
                      保存到行程库
                    </button>
                  </div>

                  {/* 请求体预览 */}
                  <details className="mt-4 rounded-xl border border-slate-200 bg-slate-900" open>
                    <summary className="cursor-pointer select-none px-4 py-2.5 text-xs font-medium text-slate-300">
                      POST /api/trips/plan · 请求体
                    </summary>
                    <pre className="thin-scroll overflow-x-auto px-4 pb-3 font-mono text-[11px] leading-5 text-emerald-300">
                      {requestPayload}
                    </pre>
                  </details>

                  {/* Day by Day 预览（紧凑） */}
                  <h4 className="mb-4 mt-6 text-sm font-semibold text-ink-soft">
                    Day by Day 行程
                  </h4>
                  <ItineraryView
                    days={chengduTrip.itinerary!}
                    compact
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
