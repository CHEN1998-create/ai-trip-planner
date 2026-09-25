import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "登录 · 漫游 AI" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="dot-grid grid min-h-screen place-items-center px-4 py-12">
      <AuthForm mode="login" nextPath={searchParams.next ?? "/planner"} />
    </main>
  );
}
