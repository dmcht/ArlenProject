import { ACTIVIDADES_SEMANALES } from "@/data/actividad-semanal";
import { loadAdminUserEmailMap } from "@/lib/conecta/admin/load-admin-user-emails";
import { createAdminClient } from "@/lib/supabase/admin";

export type SemanalEleccionAdminRow = {
  id: string;
  userId: string;
  email: string | null;
  displayName: string | null;
  weekLunesYmd: string;
  activityIndex: number;
  activityLabel: string;
  chosenOptionIndex: number;
  chosenText: string;
  recomendada: boolean;
  updatedAt: string;
};

function activityLabel(index: number): string {
  const a = ACTIVIDADES_SEMANALES[index];
  if (!a) return `Actividad ${index + 1}`;
  const head = a.escenario?.trim() || a.pregunta?.trim() || "—";
  const short = head.length > 56 ? `${head.slice(0, 53)}…` : head;
  return `Actividad ${a.numero} · ${short}`;
}

function resolveOpcion(
  activityIndex: number,
  optionIndex: number,
): { texto: string; recomendada: boolean } {
  const act = ACTIVIDADES_SEMANALES[activityIndex];
  const op = act?.opciones[optionIndex];
  if (!op) {
    return { texto: `Índice ${optionIndex} (fuera de catálogo)`, recomendada: false };
  }
  return { texto: op.texto, recomendada: op.recomendada };
}

export async function loadSemanalEleccionesForAdmin(): Promise<
  SemanalEleccionAdminRow[]
> {
  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from("semanal_elecciones")
    .select(
      "id, user_id, week_lunes_ymd, activity_index, chosen_option_index, updated_at",
    )
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

  return (rows ?? []).map((r) => {
    const chosenIdx =
      typeof r.chosen_option_index === "number" ? r.chosen_option_index : 0;
    const actIdx =
      typeof r.activity_index === "number" ? r.activity_index : 0;
    const { texto, recomendada } = resolveOpcion(actIdx, chosenIdx);

    return {
      id: r.id,
      userId: r.user_id,
      email: emails.get(r.user_id) || null,
      displayName: profileMap.get(r.user_id) ?? null,
      weekLunesYmd: r.week_lunes_ymd,
      activityIndex: actIdx,
      activityLabel: activityLabel(actIdx),
      chosenOptionIndex: chosenIdx,
      chosenText: texto,
      recomendada,
      updatedAt: r.updated_at,
    };
  });
}
