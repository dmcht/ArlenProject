"use client";

import { useState } from "react";
import type { ActividadSemanal } from "@/data/actividad-semanal";
import type { SemanalWeekMeta } from "@/lib/conecta/semanal-week";

export function SemanalClient({
  actividad,
  meta,
}: {
  actividad: ActividadSemanal;
  meta: SemanalWeekMeta;
}) {
  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-violet-200/80 bg-violet-50/80 px-4 py-3 text-center ring-1 ring-violet-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
          Esta semana
        </p>
        <p className="mt-1 text-sm font-bold text-violet-900">
          Semana ISO {meta.semanaISO} · {meta.anioISO}
        </p>
        <p className="mt-0.5 text-xs text-violet-700/80">
          Actividad {meta.actividadNumero} de 8 · la siguiente rotará la próxima
          semana
        </p>
      </div>

      <ol className="mt-6">
        <ActividadCard act={actividad} />
      </ol>
    </div>
  );
}

function ActividadCard({ act }: { act: ActividadSemanal }) {
  const [elegido, setElegido] = useState<number | null>(null);

  return (
    <li className="rounded-2xl border border-violet-100 bg-white/95 p-5 shadow-sm ring-1 ring-violet-50">
      <h2 className="text-sm font-bold uppercase tracking-wide text-violet-700">
        Actividad {act.numero}
      </h2>
      {act.escenario ? (
        <p className="mt-2 text-sm font-medium text-slate-800">{act.escenario}</p>
      ) : null}
      {act.pregunta ? (
        <p className="mt-2 text-sm font-semibold text-slate-700">{act.pregunta}</p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        {act.opciones.map((op, idx) => {
          const seleccionado = elegido === idx;
          const mostrar = elegido !== null;
          const esRecomendadaVisible = mostrar && op.recomendada;

          return (
            <button
              key={op.texto}
              type="button"
              disabled={elegido !== null}
              onClick={() => setElegido(idx)}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition disabled:cursor-default ${
                !mostrar
                  ? "border-slate-200 bg-slate-50/80 text-slate-800 hover:border-violet-300 hover:bg-violet-50/50"
                  : seleccionado && op.recomendada
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : seleccionado && !op.recomendada
                      ? "border-amber-300 bg-amber-50 text-amber-950"
                      : esRecomendadaVisible
                        ? "border-emerald-400 bg-emerald-50/70 text-emerald-900 ring-1 ring-emerald-200"
                        : "border-slate-100 bg-slate-50 text-slate-500 opacity-80"
              }`}
            >
              {op.texto}
              {mostrar && op.recomendada ? (
                <span className="mt-1 block text-xs font-normal text-emerald-800">
                  Opción recomendada para un buen clima laboral
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {elegido !== null ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          {act.opciones[elegido]?.recomendada
            ? "Buena elección: refuerza el cuidado mutuo y la confianza en el equipo."
            : "Reflexiona: otras reacciones pueden alejar o incomodar. La opción marcada en verde suele abrir diálogo y respeto."}
        </p>
      ) : null}
    </li>
  );
}
