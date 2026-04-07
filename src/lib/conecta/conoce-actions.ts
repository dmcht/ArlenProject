"use server";

import { revalidatePath } from "next/cache";
import { isoWeekMondayYmd } from "@/lib/conecta/semanal-week";
import { createClient } from "@/lib/supabase/server";

export async function saveConoceRespuestas(
  activityIndex: number,
  answers: Record<string, string>,
) {
  if (activityIndex < 0 || activityIndex > 7) {
    return { ok: false as const, error: "Actividad no válida" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Inicia sesión para guardar en la nube" };
  }

  const week = isoWeekMondayYmd();
  const { error } = await supabase.from("conoce_respuestas").upsert(
    {
      user_id: user.id,
      week_lunes_ymd: week,
      activity_index: activityIndex,
      answers,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,week_lunes_ymd" },
  );

  if (!error) await revalidatePath("/conoce");
  return { ok: !error, error: error?.message };
}
