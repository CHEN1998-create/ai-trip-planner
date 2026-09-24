import Link from "next/link";
import { Sparkles } from "./icons";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg gradient-brand text-white">
              <Sparkles width={16} height={16} />
            </span>
            <span className="font-semibold">
              漫游<span className="gradient-text"> AI</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink-mute">
            面向真实旅行场景的 AI 规划 Agent：把结构化输入转成可执行的 Day by
            Day 行程，支持保存、调整、重生成与导出。
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">产品</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-mute">
            <li>
              <Link href="/planner" className="hover:text-brand-600">
                规划行程
              </Link>
            </li>
            <li>
              <Link href="/history" className="hover:text-brand-600">
                历史行程
              </Link>
            </li>
            <li>
              <Link href="/trips/trip-chengdu" className="hover:text-brand-600">
                示例行程
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">运营</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-mute">
            <li>
              <Link href="/admin" className="hover:text-brand-600">
                管理后台
              </Link>
            </li>
            <li className="text-slate-400">任务监控（规划中）</li>
            <li className="text-slate-400">数据看板（规划中）</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © 2026 漫游 AI · 智能旅游规划 Agent 编排平台 · 前端骨架（Mock 数据）
      </div>
    </footer>
  );
}
