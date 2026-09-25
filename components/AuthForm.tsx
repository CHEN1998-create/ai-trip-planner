"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ensureTripProfile } from "@/lib/supabase/membership";
import { APP_KEY } from "@/lib/auth/constants";
import {
  Sparkles,
  Loading,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "./icons";

type Mode = "login" | "register";

const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Supabase 常见错误码 → 中文提示 */
function translateError(message: string) {
  if (message.includes("Invalid login credentials"))
    return "邮箱或密码错误，请检查后重试";
  if (message.includes("Email not confirmed"))
    return "邮箱尚未完成验证，请先点击确认邮件中的链接";
  if (message.includes("already registered") || message.includes("already been registered"))
    return "该邮箱已注册，请直接登录或找回密码";
  if (message.includes("Password should be at least"))
    return "密码长度至少 6 位";
  if (message.includes("fetch failed") || message.includes("Failed to fetch") || message.includes("signal timed out"))
    return "无法连接登录服务，请检查网络或代理设置后重试";
  return message;
}

/** 网络不通时 Supabase 内部会多次重试，这里加总超时保证 12 秒内必有明确反馈 */
function withTimeout<T>(promise: Promise<T>, ms = 12000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("请求超时")), ms)
    ),
  ]);
}

export default function AuthForm({
  mode,
  nextPath,
}: {
  mode: Mode;
  nextPath: string;
}) {
  const router = useRouter();
  const isLogin = mode === "login";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needConfirm, setNeedConfirm] = useState(false);

  const validate = () => {
    if (!email.trim()) return "请输入邮箱";
    if (!emailReg.test(email.trim())) return "邮箱格式不正确";
    if (!password) return "请输入密码";
    if (password.length < 6) return "密码长度至少 6 位";
    if (!isLogin) {
      if (!confirm) return "请再次输入密码";
      if (password !== confirm) return "两次输入的密码不一致";
    }
    return null;
  };

  const safeNext = nextPath.startsWith("/") ? nextPath : "/planner";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();

      if (isLogin) {
        const { error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
        );
        if (error) {
          setError(translateError(error.message));
          return;
        }
        // 共享账号池：可能是其他 app 的老用户，首次进入需确保 trip 成员身份
        await ensureTripProfile(supabase);
        router.push(safeNext);
        router.refresh();
      } else {
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              // app 标识：数据库触发器据此自动建立 trip.profiles 成员行
              data: {
                app: APP_KEY,
                display_name: displayName.trim() || undefined,
              },
            },
          })
        );
        if (error) {
          setError(translateError(error.message));
          return;
        }
        // Supabase 开启邮箱确认时不返回 session（成员行已由触发器建好，
        // 验证邮件后登录即可）；关闭确认时直接确保身份并进入
        if (data.session) {
          await ensureTripProfile(supabase, displayName.trim() || undefined);
          router.push(safeNext);
          router.refresh();
        } else {
          setNeedConfirm(true);
        }
      }
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "请求超时";
      setError(
        isTimeout
          ? "连接登录服务超时，请检查网络或代理设置后重试"
          : "网络异常，请稍后重试"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Supabase 未配置时的引导
  if (!isSupabaseConfigured) {
    return (
      <div className="card w-full max-w-md p-8">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-500">
          <AlertTriangle width={24} height={24} />
        </div>
        <h2 className="mt-4 text-lg font-bold">尚未配置 Supabase 鉴权</h2>
        <p className="mt-2 text-sm leading-6 text-ink-mute">
          登录 / 注册由 Supabase Auth 提供。在项目根目录{" "}
          <code>.env.local</code> 中填入以下两个变量后重启{" "}
          <code>npm run dev</code> 即可启用：
        </p>
        <pre className="thin-scroll mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] leading-5 text-emerald-300">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
        </pre>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          获取位置：Supabase 控制台 → Project Settings → API。
          配置前规划台等页面仍可直接访问演示。
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600"
        >
          ← 返回首页
        </Link>
      </div>
    );
  }

  // 注册后需邮箱确认
  if (needConfirm) {
    return (
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-500">
          <CheckCircle width={24} height={24} />
        </div>
        <h2 className="mt-4 text-lg font-bold">注册成功，请验证邮箱</h2>
        <p className="mt-2 text-sm leading-6 text-ink-mute">
          我们已向 <span className="font-medium text-ink">{email}</span>{" "}
          发送了确认邮件，点击邮件中的链接后即可登录。
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl gradient-brand px-5 py-2.5 text-sm font-medium text-white"
        >
          去登录
          <ArrowRight width={15} height={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-md p-8">
      <div className="flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white">
          <Sparkles width={18} height={18} />
        </span>
        <span className="text-lg font-semibold">
          漫游<span className="gradient-text"> AI</span>
        </span>
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        {isLogin ? "欢迎回来" : "创建账号"}
      </h1>
      <p className="mt-1 text-sm text-ink-mute">
        {isLogin
          ? "登录后继续规划与管理你的行程"
          : "注册后即可生成、保存并导出旅行计划"}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {!isLogin && (
          <div>
            <label htmlFor="af-nickname" className="field-label">昵称（选填）</label>
            <input
              id="af-nickname"
              name="nickname"
              className="field-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="旅行者"
            />
          </div>
        )}

        <div>
          <label htmlFor="af-email" className="field-label">邮箱</label>
          <input
            id="af-email"
            name="email"
            type="email"
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="af-password" className="field-label">密码</label>
          <input
            id="af-password"
            name="password"
            type="password"
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLogin ? "请输入密码" : "至少 6 位"}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="af-confirm" className="field-label">确认密码</label>
            <input
              id="af-confirm"
              name="confirm-password"
              type="password"
              className="field-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="再次输入密码"
              autoComplete="new-password"
            />
          </div>
        )}

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-600">
            <AlertTriangle width={15} height={15} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-3 text-sm font-semibold text-white shadow-lift transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loading width={16} height={16} className="animate-spin" />
              {isLogin ? "登录中…" : "注册中…"}
            </>
          ) : isLogin ? (
            "登录"
          ) : (
            "注册并登录"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-mute">
        {isLogin ? "还没有账号？" : "已经有账号了？"}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="ml-1 font-medium text-brand-600 hover:text-brand-700"
        >
          {isLogin ? "立即注册" : "直接登录"}
        </Link>
      </p>
    </div>
  );
}
