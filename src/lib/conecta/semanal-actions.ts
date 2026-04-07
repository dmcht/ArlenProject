"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ACTIVIDADES_SEMANALES } from "@/data/actividad-semanal";
import {
  CICLO_LUNES_COOKIE,
  getSemanalActivityIndex,
  isoWeekMondayYmd,
} from "@/lib/conecta/semanal-week";
import { createClient } from "@/lib/supabase/server";

export async function saveSemanalEleccion(chosenOptionIndex: number) {
  const jar = await cookies();
  const cicloLunesCookie = jar.get(CICLO_LUNES_COOKIE)?.value ?? null;
  const activityIndex = getSemanalActivityIndex(undefined, {
    cicloLunesCookie,
  });
  const act = ACTIVIDADES_SEMANALES[activityIndex];
  if (!act) {
    return { ok: false as const, error: "Actividad no válida" };
  }
  if (
    chosenOptionIndex < 0 ||
    chosenOptionIndex >= act.opciones.length ||
    !Number.isInteger(chosenOptionIndex)
  ) {
    return { ok: false as const, error: "Opción no válida" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Inicia sesión para guardar en la nube" };
  }

  const week = isoWeekMondayYmd();
  const { error } = await supabase.from("semanal_elecciones").upsert(
    {
      user_id: user.id,
      week_lunes_ymd: week,
      activity_index: activityIndex,
      chosen_option_index: chosenOptionIndex,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,week_lunes_ymd" },
  );

  if (!error) await revalidatePath("/actividad");
  return { ok: !error, error: error?.message };
}
