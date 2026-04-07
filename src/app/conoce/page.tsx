import Link from "next/link";
import { cookies } from "next/headers";
import {
  CONOCE_ACTIVIDADES,
  CONOCE_INTRO,
} from "@/data/conoce-companero";
import {
  CICLO_LUNES_COOKIE,
  getSemanalActivityIndex,
  getSemanalWeekMeta,
  isoWeekMondayYmd,
} from "@/lib/conecta/semanal-week";
import { createClient } from "@/lib/supabase/server";
import { ConoceClient } from "./conoce-client";

export const dynamic = "force-dynamic";

export default async function ConocePage() {
  const jar = await cookies();
  const cicloLunesCookie = jar.get(CICLO_LUNES_COOKIE)?.value ?? null;
  const opts = { cicloLunesCookie };
  const idx = getSemanalActivityIndex(undefined, opts);
  const meta = getSemanalWeekMeta(undefined, opts);
  const actividad = CONOCE_ACTIVIDADES[idx];
  const weekLunes = isoWeekMondayYmd();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialAnswers: Record<string, string> | null = null;
  let serverSyncToken = `${weekLunes}:guest`;
  let hasServerResponses = false;
  let serverSavedLabel: string | null = null;

  if (user) {
    const { data, error } = await supabase
      .from("conoce_respuestas")
      .select("answers, updated_at")
      .eq("user_id", user.id)
      .eq("week_lunes_ymd", weekLunes)
      .maybeSingle();

    if (!error && data) {
      const raw = data.answers;
      if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
        const normalized: Record<string, string> = {};
        for (const [k, v] of Object.entries(raw)) {
          if (v != null) normalized[k] = String(v);
        }
        initialAnswers = normalized;
        hasServerResponses = Object.values(normalized).some(
          (v) => v.trim().length > 0,
        );
      }
      const updated = data.updated_at;
      serverSyncToken = `${weekLunes}:${updated ?? "none"}`;
      if (updated && hasServerResponses) {
        serverSavedLabel = new Intl.DateTimeFormat("es-MX", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(updated));
      }
    } else {
      serverSyncToken = `${weekLunes}:none`;
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
          Conocer al compañero
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-400">
          {CONOCE_INTRO} Cada semana verás un bloque de temas (1…8), alineado con el
          ciclo de la actividad semanal. Anota lo que quieras recordar; con sesión
          iniciada se guarda en tu cuenta.
        </p>

        <ConoceClient
          key={serverSyncToken}
          actividad={actividad}
          meta={meta}
          activityIndex={idx}
          weekLunesYmd={weekLunes}
          initialAnswers={initialAnswers}
          hasServerResponses={hasServerResponses}
          serverSavedLabel={serverSavedLabel}
          isAuthenticated={!!user}
        />
      </div>
    </div>
  );
}
