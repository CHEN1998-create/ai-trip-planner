"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./env";

export { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./env";

/** 单次请求超时：网络不通时避免 fetch 无限挂起（国内直连 supabase.co 可能丢包） */
const REQUEST_TIMEOUT_MS = 8000;

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }),
    },
  });
}
