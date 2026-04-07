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
      <div className="rounded-2xl border border-zinc-600/60 bg-gradient-to-br from-zinc-800/90 to-zinc-950/90 px-4 py-3 text-center ring-1 ring-zinc-600/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Esta semana
        </p>
        <p className="mt-1 text-sm font-bold text-zinc-50">
          {meta.semanaEtiqueta}
        </p>
        <p className="mt-0.5 text-xs text-zinc-400">
          Bloque {meta.actividadNumero} de 8 · mismo ciclo que la actividad semanal
        </p>
        <p className="mt-3 border-t border-zinc-600/50 pt-3 text-left text-[0.7rem] leading-snug text-zinc-300">
          {meta.detalleCiclo}
        </p>
      </div>

      {yaRespondiste ? (
        <div
          className="mt-4 flex flex-col gap-1 rounded-2xl border border-zinc-600/80 bg-zinc-800/60 px-4 py-3 text-zinc-100 ring-1 ring-zinc-600/40"
          role="status"
        >
          <p className="text-sm font-semibold text-zinc-50">
            Ya respondiste este bloque esta semana
          </p>
          {serverSavedLabel ? (
            <p className="text-xs text-zinc-400">
              Guardado en tu cuenta: {serverSavedLabel}
            </p>
          ) : isAuthenticated ? (
            <p className="text-xs text-zinc-400">
              Puedes seguir editando; los cambios se guardan al escribir o al salir
              de la página.
            </p>
          ) : (
            <p className="text-xs text-zinc-400">
              Borrador en este dispositivo. Inicia sesión para guardar en la nube.
            </p>
          )}
        </div>
      ) : null}

      <ol className="mt-6">
        <li className="rounded-2xl border border-zinc-700/80 bg-zinc-900/50 p-5 shadow-lg ring-1 ring-zinc-600/40">
          <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-200">
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
                    className="block text-left text-sm font-medium text-zinc-300"
                  >
                    <span className="mb-1.5 block text-zinc-400">{pregunta}</span>
                    <textarea
                      name={`conoce-${key}`}
                      rows={3}
                      value={answers[key] ?? ""}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full resize-y rounded-xl border border-zinc-600 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 shadow-inner outline-none ring-zinc-500/30 transition placeholder:text-zinc-500 focus:border-zinc-400 focus:ring-2"
                      placeholder="Escribe una nota breve (opcional)…"
                    />
                  </label>
                );
              })}
            </div>
          ) : null}

          {actividad.nota ? (
            <div className="mt-4">
              <p className="text-sm font-medium leading-relaxed text-zinc-200">
                {actividad.nota}
              </p>
              <label className="mt-3 block text-left text-sm font-medium text-zinc-300">
                <span className="mb-1.5 block text-zinc-400">
                  Tu reflexión o acuerdos
                </span>
                <textarea
                  name="conoce-nota"
                  rows={3}
                  value={answers["0"] ?? ""}
                  onChange={(e) => updateField("0", e.target.value)}
                  className="w-full resize-y rounded-xl border border-zinc-600 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 shadow-inner outline-none ring-zinc-500/30 transition placeholder:text-zinc-500 focus:border-zinc-400 focus:ring-2"
                  placeholder="Opcional…"
                />
              </label>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 border-t border-zinc-700/60 pt-4">
            {isAuthenticated ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={guardarAhora}
                    disabled={pending}
                    className="rounded-xl bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-md shadow-black/30 transition hover:from-zinc-200 hover:via-white hover:to-zinc-300 disabled:opacity-60"
                  >
                    {pending ? "Guardando…" : "Guardar ahora"}
                  </button>
                  {savedAt ? (
                    <span className="text-xs text-zinc-400">
                      Último guardado hoy · {savedAt}
                    </span>
                  ) : null}
                  {edited && !pending ? (
                    <span className="text-xs text-zinc-500">
                      Se guardará solo al dejar de escribir o al cambiar de página…
                    </span>
                  ) : null}
                </div>
                {error ? (
                  <p className="text-xs text-red-400">{error}</p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-zinc-400">
                <Link
                  href="/login"
                  className="font-semibold text-white underline-offset-2 hover:underline"
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
