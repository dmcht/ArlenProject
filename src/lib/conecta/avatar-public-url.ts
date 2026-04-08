import type { SupabaseClient } from "@supabase/supabase-js";
import { PROFILE_AVATAR_BUCKET } from "@/lib/conecta/profile-avatar-bucket";

export function avatarPublicUrl(
  supabase: SupabaseClient,
  path: string | null | undefined,
): string | null {
  const p = path?.trim();
  if (!p) return null;
  const { data } = supabase.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(p);
  return data.publicUrl;
}
