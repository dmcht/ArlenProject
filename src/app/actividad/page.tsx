import Link from "next/link";
import { cookies } from "next/headers";
import {
  ACTIVIDADES_SEMANALES,
  SEMANAL_INTRO,
} from "@/data/actividad-semanal";
import {
  CICLO_LUNES_COOKIE,
  getSemanalActivityIndex,
  getSemanalWeekMeta,
  isoWeekMondayYmd,
} from "@/lib/conecta/semanal-week";
import { createClient } from "@/lib/supabase/server";
import { SemanalClient } from "./semanal-client";

export const dynamic = "force-dynamic";

export default async function ActividadPage() {
  const jar = await cookies();
  const cicloLunesCookie = jar.get(CICLO_LUNES_COOKIE)?.value ?? null;
  const opts = { cicloLunesCookie };
  const idx = getSemanalActivityIndex(undefined, opts);
  const actividad = ACTIVIDADES_SEMANALES[idx];
  const meta = getSemanalWeekMeta(undefined, opts);
  const weekLunes = isoWeekMondayYmd();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialChosen: number | null = null;
  let clientKey = `${weekLunes}-${idx}-guest`;

  if (user) {
    const { data, error } = await supabase
      .from("semanal_elecciones")
      .select("chosen_option_index, activity_index, updated_at")
      .eq("user_id", user.id)
      .eq("week_lunes_ymd", weekLunes)
      .maybeSingle();

    if (!error && data) {
      const storedIdx = data.chosen_option_index;
      const storedAct = data.activity_index;
      if (
        typeof storedIdx === "number" &&
        storedAct === idx &&
        storedIdx >= 0 &&
        storedIdx < actividad.opciones.length
      ) {
        initialChosen = storedIdx;
      }
      clientKey = `${weekLunes}-${idx}-${data.updated_at ?? "ok"}`;
    } else {
      clientKey = `${weekLunes}-${idx}-none`;
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 via-neutral-950 to-black px-4 py-8 pb-12 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="inline-flex text-sm font-semibold text-zinc-400 underline-offset-4 hover:text-white hover:underline"
        >
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-zinc-50 sm:text-[1.65rem]">
          Actividad semanal
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-400">
          {SEMANAL_INTRO} Solo una situación por semana. Tu ciclo de 8 actividades
          empieza en la <span className="font-semibold text-slate-700">1</span>{" "}
          la primera vez que entras (o si no hay fecha guardada); las semanas
          siguientes avanzan 2, 3… y vuelven a 1. La opción elegida se guarda en
          tu cuenta. Opcional en servidor:{" "}
          <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-200">
            ACTIVIDAD_SEMANAL_INICIO=YYYY-MM-DD
          </code>{" "}
          (idealmente un lunes) para fijar el inicio del ciclo para todos.
        </p>

        <SemanalClient
          key={clientKey}
          actividad={actividad}
          meta={meta}
          activityIndex={idx}
          weekLunesYmd={weekLunes}
          initialChosen={initialChosen}
          isAuthenticated={!!user}
        />
      </div>
    </div>
  );
}
