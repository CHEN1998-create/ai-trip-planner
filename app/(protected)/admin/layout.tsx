import { getCurrentUser, createClient } from "@/lib/supabase/server";
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
    if (!user) {
      return <AdminDenied email={null} withLogin />;
    }

    // 管理员判定走 DB 白名单表（admin_emails，见 supabase/admin.sql）
    const supabase = await createClient();
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) {
      return <AdminDenied email={user.email ?? null} withLogin={false} />;
    }
  }

  return <>{children}</>;
}

function AdminDenied({
  email,
  withLogin,
}: {
  email: string | null;
  withLogin: boolean;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-lg place-items-center px-4 py-28 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
          <ShieldCheck width={28} height={28} />
        </span>
        <h1 className="mt-5 text-xl font-bold">
          {withLogin ? "请先登录" : "无管理员权限"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-mute">
          {withLogin ? (
            <>管理后台仅对管理员开放，请先登录后再访问。</>
          ) : (
            <>
              当前账号{email ? `（${email}）` : ""}不在管理员白名单中。请在
              Supabase SQL Editor 执行项目 <code>supabase/admin.sql</code>{" "}
              后，将其邮箱插入 <code>admin_emails</code> 表：
              <code className="mt-2 block rounded-lg bg-slate-100 px-3 py-2 text-left text-xs">
                insert into admin_emails (email) values (&apos;{email ?? "your@email"}&apos;);
              </code>
            </>
          )}
        </p>
      </main>
    </div>
  );
}
