import Link from "next/link";
import {
  ACTIVIDADES_SEMANALES,
  SEMANAL_INTRO,
} from "@/data/actividad-semanal";
import {
  getSemanalActivityIndex,
  getSemanalWeekMeta,
} from "@/lib/conecta/semanal-week";
import { SemanalClient } from "./semanal-client";

export const dynamic = "force-dynamic";

export default function ActividadPage() {
  const idx = getSemanalActivityIndex();
  const actividad = ACTIVIDADES_SEMANALES[idx];
  const meta = getSemanalWeekMeta();

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
          {SEMANAL_INTRO} Cada semana verás una sola situación; al cambiar la
          semana ISO, la actividad rota entre las ocho.
        </p>

        <SemanalClient actividad={actividad} meta={meta} />
      </div>
    </div>
  );
}
