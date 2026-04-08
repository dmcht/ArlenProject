import { avatarPublicUrl } from "@/lib/conecta/avatar-public-url";
import { createClient } from "@/lib/supabase/server";

export type UserProgressPayload = {
  charlas: number;
  cafes: number;
  reconocimientos: number;
  earnedBadgeIds: string[];
  quote: string;
  isAuthenticated: boolean;
  userEmail: string | null;
  displayName: string;
  avatarUrl: string | null;
};

const FALLBACK_QUOTE =
  "Un buen trabajo fortalece una buena amistad";

function todayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getUserProgress(): Promise<UserProgressPayload> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return {
      charlas: 0,
      cafes: 0,
      reconocimientos: 0,
      earnedBadgeIds: [],
      quote: FALLBACK_QUOTE,
      isAuthenticated: false,
      userEmail: null,
      displayName: "Usuario",
      avatarUrl: null,
    };
  }

  let quoteBody = FALLBACK_QUOTE;
  const today = todayUtcDateString();
  const quoteToday = await supabase
    .from("daily_quotes")
    .select("body")
    .eq("active_on", today)
    .maybeSingle();

  if (!quoteToday.error && quoteToday.data?.body) {
    quoteBody = quoteToday.data.body;
  } else {
    const latest = await supabase
      .from("daily_quotes")
      .select("body")
      .order("active_on", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!latest.error && latest.data?.body) {
      quoteBody = latest.data.body;
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      charlas: 0,
      cafes: 0,
      reconocimientos: 0,
      earnedBadgeIds: [],
      quote: quoteBody,
      isAuthenticated: false,
      userEmail: null,
      displayName: "Usuario",
      avatarUrl: null,
    };
  }

  const profile = await supabase
    .from("profiles")
    .select(
      "charlas_realizadas, cafes_participados, reconocimientos_dados, display_name",
    )
    .eq("id", user.id)
    .maybeSingle();

  const avatarRow = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  const badges = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", user.id);

  const displayName =
    (!profile.error && profile.data?.display_name?.trim()) ||
    user.email?.split("@")[0]?.trim() ||
    "Usuario";

  const avatarUrl =
    avatarRow.error || !avatarRow.data
      ? null
      : avatarPublicUrl(supabase, avatarRow.data.avatar_path);

  return {
    charlas: profile.error ? 0 : (profile.data?.charlas_realizadas ?? 0),
    cafes: profile.error ? 0 : (profile.data?.cafes_participados ?? 0),
    reconocimientos: profile.error
      ? 0
      : (profile.data?.reconocimientos_dados ?? 0),
    earnedBadgeIds: badges.error
      ? []
      : (badges.data?.map((r) => r.badge_id) ?? []),
    quote: quoteBody,
    isAuthenticated: true,
    userEmail: user.email ?? null,
    displayName,
    avatarUrl,
  };
}
