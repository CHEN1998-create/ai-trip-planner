import type { SupabaseClient } from "@supabase/supabase-js";
import { APP_SCHEMA } from "@/lib/auth/constants";

export interface TripProfile {
  id: string;
  email: string;
  display_name: string | null;
  app: string;
  role: "member" | "admin";
  created_at: string;
  updated_at: string;
}

const PROFILE_COLUMNS =
  "id, email, display_name, app, role, created_at, updated_at";

/**
 * 确保当前登录用户在 trip schema 中拥有成员行（传入任意端的 supabase client）。
 * - 新注册（带 app 标识）：数据库触发器已自动建档，这里只做确认
 * - 共享账号池老用户首次进入：通过 SECURITY DEFINER RPC 自助加入
 * 幂等：已存在时 RPC 原样返回，不产生写入。
 */
export async function ensureTripProfile(
  supabase: SupabaseClient,
  displayName?: string
): Promise<TripProfile | null> {
  const { data, error } = await supabase
    .schema(APP_SCHEMA)
    .rpc("ensure_profile", { p_display_name: displayName ?? null });

  if (error) throw error;
  return (data ?? null) as TripProfile | null;
}

/** 查询指定用户的 trip 成员身份；未加入或查询失败返回 null */
export async function getTripProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<TripProfile | null> {
  const { data, error } = await supabase
    .schema(APP_SCHEMA)
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  return (data ?? null) as TripProfile | null;
}
