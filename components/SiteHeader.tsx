"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ArrowRight } from "./icons";

const navItems = [
  { href: "/planner", label: "规划行程" },
  { href: "/history", label: "历史行程" },
  { href: "/admin", label: "管理后台" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white shadow-lift">
            <Sparkles width={18} height={18} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">
            漫游<span className="gradient-text"> AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-soft hover:bg-slate-100 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-xs font-bold text-white sm:grid">
            旅
          </div>
          <Link
            href="/planner"
            className="group inline-flex items-center gap-1.5 rounded-xl gradient-brand px-4 py-2 text-sm font-medium text-white shadow-lift transition hover:shadow-glow"
          >
            开始规划
            <ArrowRight
              width={15}
              height={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
