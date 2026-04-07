"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ConoceActividad } from "@/data/conoce-companero";
import { saveConoceRespuestas } from "@/lib/conecta/conoce-actions";
import type { SemanalWeekMeta } from "@/lib/conecta/semanal-week";

function buildEmptyAnswers(act: ConoceActividad): Record<string, string> {
  const out: Record<string, string> = {};
  if (act.preguntas.length > 0) {
    act.preguntas.forEach((_, i) => {
      out[String(i)] = "";
    });
  } else if (act.nota) {
    out["0"] = "";
  }
  return out;
}

function mergeAnswers(
  act: ConoceActividad,
  saved: Record<string, string> | null,
): Record<string, string> {
  const base = buildEmptyAnswers(act);
  if (!saved) return base;
  for (const k of Object.keys(base)) {
    if (saved[k] !== undefined && saved[k] !== null) {
      base[k] = String(saved[k]);
    }
  }
  return base;
}

function storageKey(week: string, idx: number) {
  return `conoce-draft-${week}-${idx}`;
}

function answersTienenTexto(a: Record<string, string>): boolean {
  return Object.values(a).some((v) => v.trim().length > 0);
}

export function ConoceClient({
  actividad,
  meta,
  activityIndex,
  weekLunesYmd,
  initialAnswers,
  hasServerResponses,
  serverSavedLabel,
  isAuthenticated,
}: {
  actividad: ConoceActividad;
  meta: SemanalWeekMeta;
  activityIndex: number;
  weekLunesYmd: string;
  initialAnswers: Record<string, string> | null;
  hasServerResponses: boolean;
  serverSavedLabel: string | null;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState(() =>
    mergeAnswers(actividad, initialAnswers),
  );
  const [edited, setEdited] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const hydratedGuest = useRef(false);
  const answersRef = useRef(answers);
  const editedRef = useRef(edited);
  const flushSaveRef = useRef<() => void>(() => {});

  const yaRespondiste =
    hasServerResponses || answersTienenTexto(answers) || Boolean(savedAt);

  useEffect(() => {
    if (isAuthenticated || hydratedGuest.current) return;
    hydratedGuest.current = true;
    try {
      const raw = localStorage.getItem(storageKey(weekLunesYmd, activityIndex));
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        queueMicrotask(() => {
          setAnswers((prev) => ({ ...prev, ...parsed }));
        });
      }
    } catch {
      /* ignore */
    }
  }, [isAuthenticated, weekLunesYmd, activityIndex]);

  useEffect(() => {
    if (isAuthenticated) return;
    try {
      localStorage.setItem(
        storageKey(weekLunesYmd, activityIndex),
        JSON.stringify(answers),
      );
    } catch {
      /* ignore */
    }
  }, [answers, isAuthenticated, weekLunesYmd, activityIndex]);

  useLayoutEffect(() => {
    answersRef.current = answers;
    editedRef.current = edited;
    flushSaveRef.current = () => {
      if (!isAuthenticated || !editedRef.current) return;
      const payload = answersRef.current;
      startTransition(async () => {
        setError(null);
        const res = await saveConoceRespuestas(activityIndex, payload);
        if (res.ok) {
          setEdited(false);
          setSavedAt(
            new Date().toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
          router.refresh();
        } else {
          setError(res.error ?? "No se pudo guardar");
        }
      });
    };
  }, [
    answers,
    edited,
    isAuthenticated,
    activityIndex,
    router,
    startTransition,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !edited) return;
    const id = window.setTimeout(() => flushSaveRef.current(), 1500);
    return () => window.clearTimeout(id);
  }, [answers, edited, isAuthenticated, activityIndex]);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") flushSaveRef.current();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);

  useEffect(
    () => () => {
      if (!isAuthenticated || !editedRef.current) return;
      void saveConoceRespuestas(activityIndex, answersRef.current);
    },
    [isAuthenticated, activityIndex],
  );

  function updateField(key: string, value: string) {
    setEdited(true);
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function guardarAhora() {
    if (!isAuthenticated) return;
    startTransition(async () => {
      setError(null);
      const res = await saveConoceRespuestas(activityIndex, answers);
      if (res.ok) {
        setEdited(false);
        setSavedAt(
          new Date().toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo guardar");
      }
    });
  }

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-violet-200/80 bg-violet-50/80 px-4 py-3 text-center ring-1 ring-violet-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
          Esta semana
        </p>
        <p className="mt-1 text-sm font-bold text-violet-900">
          {meta.semanaEtiqueta}
        </p>
        <p className="mt-0.5 text-xs text-violet-700/80">
          Bloque {meta.actividadNumero} de 8 · mismo ciclo que la actividad semanal
        </p>
        <p className="mt-3 border-t border-violet-200/60 pt-3 text-left text-[0.7rem] leading-snug text-violet-800/90">
          {meta.detalleCiclo}
        </p>
      </div>

      {yaRespondiste ? (
        <div
          className="mt-4 flex flex-col gap-1 rounded-2xl border border-emerald-200/90 bg-emerald-50/95 px-4 py-3 text-emerald-950 ring-1 ring-emerald-100"
          role="status"
        >
          <p className="text-sm font-semibold text-emerald-900">
            Ya respondiste este bloque esta semana
          </p>
          {serverSavedLabel ? (
            <p className="text-xs text-emerald-800/90">
              Guardado en tu cuenta: {serverSavedLabel}
            </p>
          ) : isAuthenticated ? (
            <p className="text-xs text-emerald-800/90">
              Puedes seguir editando; los cambios se guardan al escribir o al salir
              de la página.
            </p>
          ) : (
            <p className="text-xs text-emerald-800/90">
              Borrador en este dispositivo. Inicia sesión para guardar en la nube.
            </p>
          )}
        </div>
      ) : null}

      <ol className="mt-6">
        <li className="rounded-2xl border border-violet-100 bg-white/95 p-5 shadow-sm ring-1 ring-violet-50">
          <h2 className="text-sm font-bold uppercase tracking-wide text-violet-700">
            Bloque {actividad.numero}
            {actividad.titulo ? ` · ${actividad.titulo}` : ""}
          </h2>

          {actividad.preguntas.length > 0 ? (
            <div className="mt-4 flex flex-col gap-4">
              {actividad.preguntas.map((pregunta, i) => {
                const key = String(i);
                return (
                  <label
                    key={key}
                    className="block text-left text-sm font-medium text-slate-700"
                  >
                    <span className="mb-1.5 block text-slate-600">{pregunta}</span>
                    <textarea
                      name={`conoce-${key}`}
                      rows={3}
                      value={answers[key] ?? ""}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 shadow-inner outline-none ring-violet-200 transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-2"
                      placeholder="Escribe una nota breve (opcional)…"
                    />
                  </label>
                );
              })}
            </div>
          ) : null}

          {actividad.nota ? (
            <div className="mt-4">
              <p className="text-sm font-medium leading-relaxed text-slate-800">
                {actividad.nota}
              </p>
              <label className="mt-3 block text-left text-sm font-medium text-slate-700">
                <span className="mb-1.5 block text-slate-600">
                  Tu reflexión o acuerdos
                </span>
                <textarea
                  name="conoce-nota"
                  rows={3}
                  value={answers["0"] ?? ""}
                  onChange={(e) => updateField("0", e.target.value)}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 shadow-inner outline-none ring-violet-200 transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-2"
                  placeholder="Opcional…"
                />
              </label>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 border-t border-violet-100 pt-4">
            {isAuthenticated ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={guardarAhora}
                    disabled={pending}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
                  >
                    {pending ? "Guardando…" : "Guardar ahora"}
                  </button>
                  {savedAt ? (
                    <span className="text-xs text-emerald-700">
                      Último guardado hoy · {savedAt}
                    </span>
                  ) : null}
                  {edited && !pending ? (
                    <span className="text-xs text-slate-500">
                      Se guardará solo al dejar de escribir o al cambiar de página…
                    </span>
                  ) : null}
                </div>
                {error ? (
                  <p className="text-xs text-red-600">{error}</p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-slate-600">
                <Link
                  href="/login"
                  className="font-semibold text-violet-700 underline-offset-2 hover:underline"
                >
                  Inicia sesión
                </Link>{" "}
                para guardar tus notas en tu cuenta. Sin sesión, se guardan solo en
                este dispositivo.
              </p>
            )}
          </div>
        </li>
      </ol>
    </div>
  );
}
