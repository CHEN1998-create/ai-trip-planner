import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "注册 · 漫游 AI" };

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="dot-grid grid min-h-screen place-items-center px-4 py-12">
      <AuthForm mode="register" nextPath={searchParams.next ?? "/planner"} />
    </main>
  );
}
