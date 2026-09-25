"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ensureTripProfile, type TripProfile } from "@/lib/supabase/membership";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: TripProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const metaName =
    (user.user_metadata?.display_name as string | undefined) ?? "";
  return {
    id: user.id,
    email: user.email ?? "",
    displayName: metaName || (user.email?.split("@")[0] ?? "旅行者"),
  };
}

export default function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
}: {
  children: ReactNode;
  initialUser?: AuthUser | null;
  initialProfile?: TripProfile | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [profile, setProfile] = useState<TripProfile | null>(initialProfile);
  const [loading, setLoading] = useState(!initialUser);
  const ensuredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const supabase = createClient();

    // 首次挂载取一次会话（处理根布局 initialUser 为 null 的情况）
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(toAuthUser(session?.user ?? null));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(toAuthUser(session?.user ?? null));
      // 仅在新登录时确保一次 trip 成员身份，避免每次 token 刷新都请求
      if (event === "SIGNED_IN" && session?.user) {
        const uid = session.user.id;
        if (ensuredRef.current !== uid) {
          ensuredRef.current = uid;
          ensureTripProfile(createClient())
            .then((p) => {
              setProfile(p);
              router.refresh();
            })
            .catch(() => {
              /* 成员身份兜底由服务端布局的门控负责 */
            });
        }
      }
      if (event === "SIGNED_OUT") {
        ensuredRef.current = null;
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signOut: async () => {
        if (isSupabaseConfigured) {
          const supabase = createClient();
          await supabase.auth.signOut();
        }
        ensuredRef.current = null;
        setUser(null);
        setProfile(null);
        router.push("/");
        router.refresh();
      },
    }),
    [user, profile, loading, router]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
