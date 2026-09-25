"use client";

import { useState } from "react";
import { Star, CheckCircle } from "./icons";

export default function FeedbackCard({ tripId }: { tripId: string }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (submitting || !score) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubmitted(true);
        return;
      }
      setError(data.error ?? "提交失败，请稍后重试");
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card flex flex-col items-center gap-2 p-6 text-center">
        <CheckCircle width={32} height={32} className="text-emerald-500" />
        <p className="text-sm font-semibold">感谢你的反馈！</p>
        <p className="text-xs text-ink-mute">
          评分与留言已进入管理后台的任务与反馈页。
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold">这份行程怎么样？</h3>
      <div className="mt-3 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setScore(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} 星`}
            className={`transition ${
              n <= (hover || score)
                ? "text-amber-400"
                : "text-slate-200 hover:text-amber-200"
            }`}
          >
            <Star width={24} height={24} />
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="说说哪里合理、哪里需要调整…"
        className="field-input mt-3 resize-none"
      />
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
      <button
        type="button"
        disabled={!score || submitting}
        onClick={submit}
        className="mt-3 w-full rounded-xl gradient-brand py-2.5 text-sm font-medium text-white transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "提交中…" : "提交反馈"}
      </button>
    </div>
  );
}
