import { CONOCE_ACTIVIDADES } from "@/data/conoce-companero";
import { loadAdminUserEmailMap } from "@/lib/conecta/admin/load-admin-user-emails";
import { createAdminClient } from "@/lib/supabase/admin";

export type ConoceResponseAdminRow = {
  id: string;
  userId: string;
  email: string | null;
  displayName: string | null;
  weekLunesYmd: string;
  activityIndex: number;
  activityLabel: string;
  answers: Record<string, string>;
  updatedAt: string;
};

function activityLabel(index: number): string {
  const a = CONOCE_ACTIVIDADES[index];
  if (!a) return `Bloque ${index + 1}`;
  return `Bloque ${a.numero} · ${a.titulo}`;
}

export async function loadConoceResponsesForAdmin(): Promise<
  ConoceResponseAdminRow[]
> {
  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from("conoce_respuestas")
    .select("id, user_id, week_lunes_ymd, activity_index, answers, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const userIds = [...new Set((rows ?? []).map((r) => r.user_id))];
  const emails = await loadAdminUserEmailMap(admin);

  const profileMap = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id, p.display_name);
    }
  }

  return (rows ?? []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    email: emails.get(r.user_id) || null,
    displayName: profileMap.get(r.user_id) ?? null,
    weekLunesYmd: r.week_lunes_ymd,
    activityIndex: r.activity_index,
    activityLabel: activityLabel(r.activity_index),
    answers:
      r.answers && typeof r.answers === "object" && !Array.isArray(r.answers)
        ? Object.fromEntries(
            Object.entries(r.answers as Record<string, unknown>).map(
              ([k, v]) => [k, v == null ? "" : String(v)],
            ),
          )
        : {},
    updatedAt: r.updated_at,
  }));
}
