import Link from "next/link";
import type { Trip } from "@/lib/mock";
import { formatCNY, paceLabel, statusMeta } from "@/lib/mock";
import { Calendar, Wallet, Refresh, ChevronRight } from "./icons";

export default function TripCard({ trip }: { trip: Trip }) {
  const status = statusMeta[trip.status];

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      {/* 封面 */}
      <div
        className={`relative h-28 bg-gradient-to-br ${trip.cover} p-4 text-white`}
      >
        <div className="hero-grid absolute inset-0 opacity-60" />
        <div className="relative flex h-full items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl drop-shadow">{trip.emoji}</span>
              <h3 className="text-lg font-bold tracking-wide">
                {trip.destination}
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-white/80">
              {trip.origin} 出发 · {trip.dayCount} 天
            </p>
          </div>
          <span className="chip bg-white/20 text-white backdrop-blur">
            {paceLabel[trip.pace]}
          </span>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-4">
        <p className="truncate text-sm font-medium text-ink">{trip.tagline}</p>
        <div className="mt-3 space-y-1.5 text-xs text-ink-mute">
          <p className="flex items-center gap-1.5">
            <Calendar width={13} height={13} />
            {trip.startDate} ~ {trip.endDate}
          </p>
          <p className="flex items-center gap-1.5">
            <Wallet width={13} height={13} />
            预算 {formatCNY(trip.budget)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className={`chip ${status.className}`}>{status.label}</span>
          <span className="flex items-center gap-2 text-xs font-medium text-brand-600">
            {trip.status === "failed" ? (
              <>
                <Refresh width={13} height={13} />
                重新生成
              </>
            ) : (
              <>
                打开行程
                <ChevronRight
                  width={14}
                  height={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
