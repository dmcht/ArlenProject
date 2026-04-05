import Link from "next/link";
import {
  CONOCE_ACTIVIDADES,
  CONOCE_INTRO,
} from "@/data/conoce-companero";

export default function ConocePage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-sky-100 via-white to-sky-50/50 px-4 py-8 pb-12 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="inline-flex text-sm font-semibold text-sky-700 underline-offset-4 hover:underline"
        >
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-sky-800 sm:text-[1.65rem]">
          Conocer al compañero
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
          {CONOCE_INTRO}
        </p>

        <ol className="mt-8 space-y-5">
          {CONOCE_ACTIVIDADES.map((act) => (
            <li
              key={act.numero}
              className="rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-sm ring-1 ring-sky-50"
            >
              <h2 className="text-sm font-bold uppercase tracking-wide text-sky-600">
                Actividad {act.numero}
                {act.titulo ? ` · ${act.titulo}` : ""}
              </h2>
              {act.preguntas.length > 0 ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                  {act.preguntas.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              ) : null}
              {act.nota ? (
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-800">
                  {act.nota}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
