"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ensureTripProfile } from "@/lib/supabase/membership";
import { createClient } from "@/lib/supabase/client";
import { Compass, Loading } from "./icons";

/**
 * 成员门控：已登录但在 trip schema 没有成员行的用户（典型场景：
 * 同一个 Supabase 项目里其他 app 的用户首次进入本应用）会看到此卡片，
 * 点击后通过 RPC 建立本应用成员身份，再进入页面。
 */
export default function MembershipGate({ email }: { email: string }) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    try {
      await ensureTripProfile(createClient());
      router.refresh();
    } catch {
      setError("加入失败，请确认已执行数据库迁移并在 API 设置中暴露 trip schema");
      setJoining(false);
    }
  };

  return (
    <main className="dot-grid grid min-h-screen place-items-center px-4 py-12">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Compass width={24} height={24} />
        </div>
        <h1 className="mt-4 text-lg font-bold">欢迎来到漫游 AI</h1>
        <p className="mt-2 text-sm leading-6 text-ink-mute">
          账号 <span className="font-medium text-ink">{email}</span>{" "}
          已登录，但还不是本应用的成员。本应用与同项目的其他应用数据独立、互不影响，点击下方按钮即可开通你的旅行规划空间。
        </p>
        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-600">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleJoin}
          disabled={joining}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-3 text-sm font-semibold text-white shadow-lift transition hover:shadow-glow disabled:opacity-70"
        >
          {joining ? (
            <>
              <Loading width={16} height={16} className="animate-spin" />
              正在开通…
            </>
          ) : (
            "加入并进入"
          )}
        </button>
      </div>
    </main>
  );
}
