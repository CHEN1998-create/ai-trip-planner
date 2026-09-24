import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BudgetBreakdown from "@/components/BudgetBreakdown";
import { chengduTrip } from "@/lib/mock";
import {
  Sparkles,
  ArrowRight,
  Route,
  PieChart,
  Layers,
  Download,
  CheckCircle,
  Zap,
  MapPin,
  Wallet,
  Compass,
  Heart,
  Calendar,
} from "@/components/icons";

const features = [
  {
    icon: Route,
    title: "结构化每日行程",
    desc: "不是一大段文本，而是 Day by Day 的时间线：几点、去哪、花多少、注意什么，一目了然。",
  },
  {
    icon: PieChart,
    title: "智能预算拆分",
    desc: "总预算自动拆到餐饮、住宿、交通、门票与每日花销，出行前心里有数。",
  },
  {
    icon: Layers,
    title: "我的行程库",
    desc: "所有计划自动保存为历史行程，随时重新打开、按原条件重生成或改偏好再算。",
  },
  {
    icon: Download,
    title: "一键导出",
    desc: "支持文本 / PDF 占位导出（MVP），可打印、可分享，失败可重试。",
  },
];

const steps = [
  {
    n: "01",
    title: "填写旅行需求",
    desc: "出发地、目的地、日期、预算、兴趣偏好与节奏，一张表单讲清楚。",
  },
  {
    n: "02",
    title: "Agent 编排生成",
    desc: "LLM 结合 POI 与规则，输出稳定的结构化 JSON 行程，过程实时可见。",
  },
  {
    n: "03",
    title: "调整、保存与导出",
    desc: "对单日安排或预算不满意可重新生成，满意后保存到行程库或导出。",
  },
];

const scenarios = [
  {
    emoji: "🌶️",
    title: "周末 3 天速通",
    desc: "周五晚出发、周日晚回家，紧凑路线不绕路。",
    meta: "3 天 · 紧凑 · 低预算",
  },
  {
    emoji: "🏔️",
    title: "长假 5-7 天深度游",
    desc: "周边联游与留白日结合，标准节奏不累不赶。",
    meta: "5-7 天 · 标准 · 中预算",
  },
  {
    emoji: "🍜",
    title: "美食主题巡礼",
    desc: "按城市味觉地图安排餐厅与小吃街，错峰取号。",
    meta: "主题偏好 · 轻松节奏",
  },
];

export default function HomePage() {
  const day1 = chengduTrip.itinerary![0];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* ================= Hero ================= */}
      <section className="relative overflow-hidden bg-[#0a0e1f] text-white">
        <div className="hero-grid absolute inset-0" />
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-indigo-200">
              <Sparkles width={14} height={14} />
              AI Agent 驱动 · 输出可执行行程，而非聊天文本
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-[56px]">
              把旅行想法，
              <br />
              变成<span className="gradient-text">可执行的行程</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              一次表单提交，Agent
              自动完成需求解析、POI 编排、预算拆分，生成 Day by Day
              的结构化旅行计划。可保存、可调整、可重生成、可导出。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/planner"
                className="group inline-flex items-center gap-2 rounded-xl gradient-brand px-6 py-3.5 text-sm font-semibold shadow-glow transition hover:brightness-110"
              >
                <Zap width={16} height={16} />
                免费生成我的行程
                <ArrowRight
                  width={16}
                  height={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/trips/trip-chengdu"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                查看示例行程
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle width={16} height={16} className="text-emerald-400" />
                30 秒生成完整行程
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle width={16} height={16} className="text-emerald-400" />
                稳定结构化 JSON
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle width={16} height={16} className="text-emerald-400" />
                3-7 天单目的地
              </span>
            </div>
          </div>

          {/* Hero 视觉卡片：AI 正在生成的行程 */}
          <div className="relative animate-fade-up [animation-delay:150ms]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🐼</span>
                  <div>
                    <p className="text-sm font-semibold">
                      成都 · 4 日慢游
                    </p>
                    <p className="text-[11px] text-slate-400">
                      上海 → 成都 · 5.1 - 5.4
                    </p>
                  </div>
                </div>
                <span className="chip border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                  <CheckCircle width={12} height={12} />
                  生成成功
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {day1.items.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-3.5 py-3"
                  >
                    <span className="font-mono text-[11px] text-slate-400">
                      {item.time}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    <span className="flex-1 truncate text-sm text-slate-200">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.cost ? `¥${item.cost}` : "免费"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 px-4 py-3">
                <span className="flex items-center gap-2 text-xs text-slate-300">
                  <Wallet width={14} height={14} />
                  预估总预算
                </span>
                <span className="text-lg font-bold">¥3,500</span>
              </div>
            </div>

            {/* 浮动卡片 */}
            <div className="absolute -right-4 -top-5 hidden animate-float rounded-2xl border border-white/10 bg-white p-3.5 text-ink shadow-2xl sm:block">
              <p className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <Sparkles width={13} height={13} className="text-brand-500" />
                Agent 编排完成
              </p>
              <p className="mt-1 text-[11px] text-ink-mute">
                4 天 · 19 个安排 · 4 类预算
              </p>
            </div>
            <div
              className="absolute -bottom-5 -left-4 hidden animate-float rounded-2xl border border-white/10 bg-white p-3.5 text-ink shadow-2xl [animation-delay:1.5s] sm:block"
            >
              <p className="text-xs font-medium text-ink-soft">成功率</p>
              <p className="mt-0.5 text-lg font-bold text-emerald-500">94.2%</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 核心能力 ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-brand-600">核心能力</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            像旅行产品，而不是聊天框
          </h2>
          <p className="mt-3 text-ink-mute">
            借鉴 Wanderlog
            的行程表达方式：输入后直接看到可编辑的每日行程、预算与移动顺序。
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="card group p-6 transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:gradient-brand group-hover:text-white">
                <f.icon width={20} height={20} />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-mute">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 使用流程 ================= */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-brand-600">
              如何使用
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">三步出发</h2>
          </div>

          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent md:block" />
            {steps.map((s) => (
              <div key={s.n} className="relative text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-brand text-lg font-bold text-white shadow-lift">
                  {s.n}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-ink-mute">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 产品预览 ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold text-brand-600">
              规划台预览
            </span>
            <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
              左边讲需求，
              <br />
              右边看着行程长出来
            </h2>
            <p className="mt-4 leading-7 text-ink-mute">
              生成过程对用户可见：解析需求 → 检索 POI → 编排日程 →
              核算预算。长任务也有明确状态反馈，失败可一键重试。
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "偏好标签多选：美食 / 历史文化 / 自然风光……",
                "三种节奏：轻松 / 标准 / 紧凑",
                "结果即时预览，满意再保存到行程库",
                "外部信息源失败时优雅降级，不阻塞生成",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle
                    width={17}
                    height={17}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <span className="text-ink-soft">{t}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/planner"
              className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-lift transition hover:shadow-glow"
            >
              进入规划台
              <ArrowRight width={16} height={16} />
            </Link>
          </div>

          {/* 迷你规划台 */}
          <div className="dot-grid rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="grid gap-4 sm:grid-cols-5">
              {/* 表单占位 */}
              <div className="card space-y-3 p-4 sm:col-span-2">
                <div>
                  <p className="text-[11px] text-ink-mute">目的地</p>
                  <div className="mt-1 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <MapPin width={14} height={14} className="text-brand-500" />
                    成都
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-ink-mute">日期</p>
                  <div className="mt-1 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <Calendar width={14} height={14} className="text-brand-500" />
                    5.1 - 5.4
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-ink-mute">偏好</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {["美食", "历史文化"].map((t) => (
                      <span
                        key={t}
                        className="chip bg-brand-50 text-brand-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg gradient-brand py-2 text-center text-xs font-semibold text-white">
                  生成行程
                </div>
              </div>

              {/* 结果占位 */}
              <div className="card overflow-hidden sm:col-span-3">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold">Day 1 · 抵达成都</p>
                </div>
                <div className="space-y-2.5 p-4">
                  {chengduTrip.itinerary![0].items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
                    >
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.time}
                      </span>
                      <span className="flex-1 truncate text-xs font-medium">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.cost ? `¥${item.cost}` : "免费"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 p-4">
                  <BudgetBreakdown
                    slices={chengduTrip.budgetBreakdown!}
                    total={chengduTrip.budget}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 场景 ================= */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-brand-600">
              适用场景
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              每次出发都值得一个好计划
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {scenarios.map((s) => (
              <div
                key={s.title}
                className="card relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="text-4xl">{s.emoji}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-mute">{s.desc}</p>
                <p className="mt-4 flex items-center gap-1.5 text-xs text-brand-600">
                  <Compass width={13} height={13} />
                  {s.meta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl gradient-brand px-8 py-16 text-center text-white shadow-glow">
          <div className="hero-grid absolute inset-0 opacity-50" />
          <div className="relative">
            <Heart width={32} height={32} className="mx-auto" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              下一趟旅行，从一个好计划开始
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/85">
              30 秒生成第一版行程，保存后可以反复调整与重生成。
            </p>
            <Link
              href="/planner"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition hover:bg-indigo-50"
            >
              <Sparkles width={16} height={16} />
              立即规划
              <ArrowRight width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
