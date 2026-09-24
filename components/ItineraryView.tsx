import type { ItineraryDay } from "@/lib/mock";
import { formatCNY } from "@/lib/mock";
import { MapPin } from "./icons";

const categoryClass: Record<string, string> = {
  交通: "bg-cyan-50 text-cyan-600",
  美食: "bg-amber-50 text-amber-600",
  景点: "bg-violet-50 text-violet-600",
  文化: "bg-indigo-50 text-indigo-600",
  休闲: "bg-emerald-50 text-emerald-600",
  住宿: "bg-rose-50 text-rose-600",
};

export default function ItineraryView({
  days,
  compact = false,
}: {
  days: ItineraryDay[];
  compact?: boolean;
}) {
  return (
    <div className="space-y-5">
      {days.map((day) => (
        <section key={day.dayIndex} className="relative pl-10">
          {/* 时间线 */}
          <div className="absolute left-[14px] top-7 bottom-0 w-px bg-gradient-to-b from-brand-200 to-transparent" />
          <div className="absolute left-0 top-0 grid h-7 w-7 place-items-center rounded-full gradient-brand text-[11px] font-bold text-white shadow-lift">
            D{day.dayIndex}
          </div>

          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
              <div>
                <h4 className="text-[15px] font-semibold">{day.title}</h4>
                {!compact && (
                  <p className="mt-0.5 text-xs text-ink-mute">{day.summary}</p>
                )}
              </div>
              <span className="chip bg-slate-50 text-ink-soft">
                日预算 {formatCNY(day.dayBudget)}
              </span>
            </div>

            <ul className="divide-y divide-slate-50">
              {day.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 px-5 py-3.5 transition hover:bg-slate-50/60"
                >
                  <span className="mt-0.5 w-11 shrink-0 font-mono text-xs font-medium text-slate-400">
                    {item.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink">
                        {item.title}
                      </span>
                      <span
                        className={`chip ${
                          categoryClass[item.category] ??
                          "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    {item.note && !compact && (
                      <p className="mt-1 flex items-start gap-1 text-xs leading-5 text-ink-mute">
                        <MapPin
                          width={12}
                          height={12}
                          className="mt-0.5 shrink-0"
                        />
                        {item.note}
                      </p>
                    )}
                  </div>
                  {typeof item.cost === "number" && item.cost > 0 ? (
                    <span className="shrink-0 text-sm font-medium text-ink-soft">
                      {formatCNY(item.cost)}
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs text-slate-400">免费</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}
