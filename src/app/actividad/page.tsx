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
} from "@/lib/conecta/semanal-week";
import { SemanalClient } from "./semanal-client";

export const dynamic = "force-dynamic";

export default async function ActividadPage() {
  const jar = await cookies();
  const cicloLunesCookie = jar.get(CICLO_LUNES_COOKIE)?.value ?? null;
  const opts = { cicloLunesCookie };
  const idx = getSemanalActivityIndex(undefined, opts);
  const actividad = ACTIVIDADES_SEMANALES[idx];
  const meta = getSemanalWeekMeta(undefined, opts);

  return (
    <div className="min-h-full bg-gradient-to-b from-violet-50 via-white to-indigo-50/40 px-4 py-8 pb-12 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="inline-flex text-sm font-semibold text-violet-700 underline-offset-4 hover:underline"
        >
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-violet-900 sm:text-[1.65rem]">
          Actividad semanal
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
          {SEMANAL_INTRO} Solo una situación por semana. Tu ciclo de 8 actividades
          empieza en la <span className="font-semibold text-slate-700">1</span>{" "}
          la primera vez que entras (o si no hay fecha guardada); las semanas
          siguientes avanzan 2, 3… y vuelven a 1. Opcional en servidor:{" "}
          <code className="rounded bg-violet-100 px-1 py-0.5 text-xs">
            ACTIVIDAD_SEMANAL_INICIO=YYYY-MM-DD
          </code>{" "}
          (idealmente un lunes) para fijar el inicio del ciclo para todos.
        </p>

        <SemanalClient actividad={actividad} meta={meta} />
      </div>
    </div>
  );
}
