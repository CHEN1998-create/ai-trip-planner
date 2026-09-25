import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./env";

/** 受保护路由前缀（未登录访问会跳到 /login 并携带 next 回跳地址） */
const protectedPrefixes = ["/planner", "/history", "/trips", "/admin"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 未配置 Supabase 时不拦截，保证骨架阶段页面仍可访问
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Edge Runtime 的 fetch 不走系统代理，网络异常时无法在此确认会话。
  // 放行并由受保护布局的 getCurrentUser()（Node Runtime，网络可用）兜底守卫，
  // 避免已登录用户被误判为未登录而弹回登录页。
  const result = await Promise.race([
    supabase.auth.getUser(),
    new Promise<"network-timeout">((resolve) =>
      setTimeout(() => resolve("network-timeout"), 8000)
    ),
  ]);

  if (result === "network-timeout") {
    console.warn("[middleware] getUser 超时，放行交由布局守卫处理");
    return response;
  }
  if (result.error) {
    console.warn(
      "[middleware] getUser 网络失败，放行交由布局守卫处理:",
      result.error.message
    );
    return response;
  }
  const user = result.data.user;

  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 已登录用户访问登录/注册页，直接进规划台
  if (user && (pathname === "/login" || pathname === "/register")) {
    const plannerUrl = request.nextUrl.clone();
    plannerUrl.pathname = "/planner";
    plannerUrl.search = "";
    return NextResponse.redirect(plannerUrl);
  }

  return response;
}
