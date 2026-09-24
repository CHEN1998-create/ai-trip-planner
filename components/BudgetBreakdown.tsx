import type { BudgetSlice } from "@/lib/mock";
import { formatCNY } from "@/lib/mock";

export default function BudgetBreakdown({
  slices,
  total,
}: {
  slices: BudgetSlice[];
  total: number;
}) {
  return (
    <div>
      {/* 总览条 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-ink-mute">预估总预算</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {formatCNY(total)}
          </p>
        </div>
        <span className="chip bg-emerald-50 text-emerald-600">
          人均 · 含住宿
        </span>
      </div>

      {/* 堆叠条 */}
      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        {slices.map((s) => (
          <div
            key={s.category}
            className={s.barClass}
            style={{ width: `${(s.amount / total) * 100}%` }}
            title={`${s.category} ${formatCNY(s.amount)}`}
          />
        ))}
      </div>

      {/* 明细 */}
      <ul className="mt-5 space-y-3">
        {slices.map((s) => (
          <li key={s.category} className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${s.barClass}`} />
            <span className="flex-1 text-sm text-ink-soft">{s.category}</span>
            <span className="text-sm font-medium">
              {formatCNY(s.amount)}
            </span>
            <span className="w-12 text-right text-xs text-slate-400">
              {Math.round((s.amount / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
