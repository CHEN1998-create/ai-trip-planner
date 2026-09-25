import { redirect } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import MembershipGate from "@/components/MembershipGate";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getTripProfile } from "@/lib/supabase/membership";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 未配置 Supabase 凭据时不拦截，保证骨架阶段仍可直接演示；
  // 配置 .env.local 后，以下鉴权与成员校验自动生效
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 逻辑隔离关键：仅通过 auth 校验不够，还必须是 trip 应用成员
  const supabase = await createClient();
  const profile = await getTripProfile(supabase, user.id);
  if (!profile) {
    return <MembershipGate email={user.email ?? ""} />;
  }

  return (
    <AuthProvider
      initialUser={{
        id: user.id,
        email: user.email ?? "",
        displayName:
          profile.display_name ||
          (user.user_metadata?.display_name as string) ||
          user.email?.split("@")[0] ||
          "旅行者",
      }}
      initialProfile={profile}
    >
      {children}
    </AuthProvider>
  );
}
