import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import SiteHeader from "@/components/SiteHeader";
import { ShieldCheck } from "@/components/icons";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 未配置 Supabase 时（骨架模式）直接放行，保证页面可演示
  if (isSupabaseConfigured) {
    const user = await getCurrentUser();
    const allowList = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (!user || !allowList.includes((user.email ?? "").toLowerCase())) {
      return (
        <div className="min-h-screen">
          <SiteHeader />
          <main className="mx-auto grid max-w-lg place-items-center px-4 py-28 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
              <ShieldCheck width={28} height={28} />
            </span>
            <h1 className="mt-5 text-xl font-bold">无管理员权限</h1>
            <p className="mt-2 text-sm leading-6 text-ink-mute">
              管理后台仅对管理员开放。如需访问，请将当前账号
              {user?.email ? `（${user.email}）` : ""}
              加入项目根目录 <code>.env.local</code> 的{" "}
              <code>ADMIN_EMAILS</code> 白名单后重启服务。
            </p>
          </main>
        </div>
      );
    }
  }

  return <>{children}</>;
}
