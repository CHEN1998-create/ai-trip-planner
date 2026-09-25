/** Supabase 环境变量（本文件无 "use client"，可被服务端模块引用） */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** 是否已配置 Supabase 环境变量 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
