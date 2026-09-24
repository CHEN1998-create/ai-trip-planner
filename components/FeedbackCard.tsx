"use client";

import { useState } from "react";
import { Star, CheckCircle } from "./icons";

export default function FeedbackCard() {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="card flex flex-col items-center gap-2 p-6 text-center">
        <CheckCircle width={32} height={32} className="text-emerald-500" />
        <p className="text-sm font-semibold">感谢你的反馈！</p>
        <p className="text-xs text-ink-mute">
          评分与留言将进入管理后台的任务与反馈页（Mock）。
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
        placeholder="说说哪里合理、哪里需要调整…"
        className="field-input mt-3 resize-none"
      />
      <button
        type="button"
        disabled={!score}
        onClick={() => setSubmitted(true)}
        className="mt-3 w-full rounded-xl gradient-brand py-2.5 text-sm font-medium text-white transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
      >
        提交反馈
      </button>
    </div>
  );
}
