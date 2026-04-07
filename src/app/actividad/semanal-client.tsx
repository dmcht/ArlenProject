"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ActividadSemanal } from "@/data/actividad-semanal";
import { saveSemanalEleccion } from "@/lib/conecta/semanal-actions";
import type { SemanalWeekMeta } from "@/lib/conecta/semanal-week";

function storageKey(week: string, activityIndex: number) {
  return `semanal-eleccion-v1-${week}-${activityIndex}`;
}

export function SemanalClient({
  actividad,
  meta,
  activityIndex,
  weekLunesYmd,
  initialChosen,
  isAuthenticated,
}: {
  actividad: ActividadSemanal;
  meta: SemanalWeekMeta;
  activityIndex: number;
  weekLunesYmd: string;
  initialChosen: number | null;
  isAuthenticated: boolean;
}) {
  return (
    <div className="mt-8">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-600/60 bg-gradient-to-br from-zinc-700 via-zinc-600 to-zinc-900 px-5 py-4 text-center text-white shadow-lg shadow-black/40 ring-1 ring-white/15">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <p className="relative text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-300">
          Esta semana
        </p>
        <p className="relative mt-1.5 text-base font-bold tracking-tight">
          {meta.semanaEtiqueta}
        </p>
        <p className="relative mt-1 text-xs text-zinc-300/95">
          Actividad {meta.actividadNumero} de 8 · semana ISO
        </p>
        <p className="relative mt-3 border-t border-white/15 pt-3 text-left text-[0.7rem] leading-snug text-zinc-200/95">
          {meta.detalleCiclo}
        </p>
      </div>

      <ol className="mt-6">
        <ActividadCard
          act={actividad}
          activityIndex={activityIndex}
          weekLunesYmd={weekLunesYmd}
          initialChosen={initialChosen}
          isAuthenticated={isAuthenticated}
        />
      </ol>
    </div>
  );
}

function ActividadCard({
  act,
  activityIndex,
  weekLunesYmd,
  initialChosen,
  isAuthenticated,
}: {
  act: ActividadSemanal;
  activityIndex: number;
  weekLunesYmd: string;
  initialChosen: number | null;
  isAuthenticated: boolean;
}) {
  const [elegido, setElegido] = useState<number | null>(initialChosen);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const hydratedGuest = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    queueMicrotask(() => {
      setElegido(initialChosen);
    });
  }, [initialChosen, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated || hydratedGuest.current) return;
    hydratedGuest.current = true;
    if (initialChosen !== null) return;
    try {
      const raw = localStorage.getItem(storageKey(weekLunesYmd, activityIndex));
      if (raw == null) return;
      const n = Number.parseInt(raw, 10);
      if (
        Number.isFinite(n) &&
        n >= 0 &&
        n < act.opciones.length
      ) {
        queueMicrotask(() => setElegido(n));
      }
    } catch {
      /* ignore */
    }
  }, [isAuthenticated, initialChosen, weekLunesYmd, activityIndex, act.opciones.length]);

  useEffect(() => {
    if (isAuthenticated || elegido === null) return;
    try {
      localStorage.setItem(
        storageKey(weekLunesYmd, activityIndex),
        String(elegido),
      );
    } catch {
      /* ignore */
    }
  }, [elegido, isAuthenticated, weekLunesYmd, activityIndex]);

  return (
    <li className="rounded-2xl border border-zinc-700/80 bg-zinc-900/50 p-5 shadow-lg shadow-black/25 ring-1 ring-zinc-600/40">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-100 ring-1 ring-zinc-600/80">
          {act.numero}
        </span>
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-200">
          Actividad {act.numero}
        </h2>
      </div>
      {act.escenario ? (
        <p className="mt-2 text-sm font-medium text-zinc-200">{act.escenario}</p>
      ) : null}
      {act.pregunta ? (
        <p className="mt-2 text-sm font-semibold text-zinc-300">{act.pregunta}</p>
      ) : null}

      <p
        className={`mt-3 rounded-xl px-3 py-2 text-xs leading-relaxed ring-1 ${
          isAuthenticated
            ? "bg-zinc-800/80 text-zinc-100 ring-zinc-600/60"
            : "bg-zinc-950/60 text-zinc-400 ring-zinc-800"
        }`}
      >
        {isAuthenticated
          ? "Con sesión iniciada, tu elección se guarda en tu cuenta para esta semana."
          : "Sin sesión, la elección se guarda solo en este navegador."}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {act.opciones.map((op, idx) => {
          const seleccionado = elegido === idx;
          const mostrar = elegido !== null;
          const esRecomendadaVisible = mostrar && op.recomendada;

          return (
            <button
              key={op.texto}
              type="button"
              disabled={elegido !== null || pending}
              onClick={() => {
                if (elegido !== null) return;
                setError(null);
                setElegido(idx);
                if (isAuthenticated) {
                  startTransition(async () => {
                    const r = await saveSemanalEleccion(idx);
                    if (!r.ok) {
                      setElegido(null);
                      setError(r.error ?? "No se pudo guardar. Intenta de nuevo.");
                    }
                  });
                }
              }}
              className={`rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-default ${
                !mostrar
                  ? "border-zinc-600 bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-100 shadow-sm hover:border-zinc-400 hover:shadow-md"
                  : seleccionado && op.recomendada
                    ? "border-zinc-300 bg-gradient-to-br from-zinc-600 to-zinc-800 text-white shadow-sm"
                    : seleccionado && !op.recomendada
                      ? "border-zinc-500 bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 shadow-sm"
                      : esRecomendadaVisible
                        ? "border-zinc-400/90 bg-zinc-800/90 text-zinc-100 ring-1 ring-zinc-600/60"
                        : "border-zinc-800 bg-zinc-950/80 text-zinc-500 opacity-90"
              }`}
            >
              {op.texto}
              {mostrar && op.recomendada ? (
                <span className="mt-1 block text-xs font-normal text-zinc-300">
                  Opción recomendada para un buen clima laboral
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {error ? (
        <p
          className="mt-3 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs font-medium text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {elegido !== null ? (
        <p className="mt-4 rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-3 py-2.5 text-xs leading-relaxed text-zinc-300">
          {act.opciones[elegido]?.recomendada
            ? "Buena elección: refuerza el cuidado mutuo y la confianza en el equipo."
            : "Reflexiona: otras reacciones pueden alejar o incomodar. La opción destacada suele abrir diálogo y respeto."}
        </p>
      ) : null}
    </li>
  );
}
