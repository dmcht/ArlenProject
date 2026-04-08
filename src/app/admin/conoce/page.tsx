import {
  AdminCode,
  AdminEmptyState,
  AdminErrorFrame,
  AdminHero,
  AdminTableThead,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminTr,
  AdminWeekPill,
} from "@/app/admin/_components/admin-chrome";
import {
  isConoceTableOrSchemaError,
  isInvalidSupabaseApiKeyError,
  isMissingServiceRoleConfigError,
} from "@/lib/conecta/admin/admin-load-messages";
import { loadConoceResponsesForAdmin } from "@/lib/conecta/admin/load-conoce-responses";

export const dynamic = "force-dynamic";

export default async function AdminConocePage() {
  let rows: Awaited<ReturnType<typeof loadConoceResponsesForAdmin>>;
  let loadError: string | null = null;

  try {
    rows = await loadConoceResponsesForAdmin();
  } catch (e) {
    rows = [];
    loadError = e instanceof Error ? e.message : "No se pudieron cargar los datos.";
  }

  return (
    <div className="space-y-2">
      <AdminHero
        title="Conoce al compañero"
        subtitle="Cada fila es una semana (lunes ISO) por usuario: bloque del ciclo y notas que guardaron en la app."
      />

      {loadError ? (
        <AdminErrorFrame>
          <p className="font-semibold text-zinc-100">No se pudo leer la base de datos</p>

          {isConoceTableOrSchemaError(loadError) ? (
            <div className="mt-3 space-y-2 border-t border-zinc-600/60 pt-3 text-xs text-zinc-300">
              <p>
                Suele indicar que la tabla{" "}
                <AdminCode>public.conoce_respuestas</AdminCode>{" "}
                no existe o que hay que recargar el esquema de la API. La clave de
                servicio del proyecto no crea tablas por sí sola.
              </p>
              <ol className="list-decimal space-y-1.5 pl-5 leading-relaxed">
                <li>
                  En Supabase → SQL Editor, ejecuta{" "}
                  <AdminCode>
                    supabase/migrations/20260406120000_conoce_respuestas.sql
                  </AdminCode>
                  .
                </li>
                <li>
                  <AdminCode>{`select pg_notify('pgrst', 'reload schema');`}</AdminCode>
                </li>
                <li>Comprueba en Table Editor que existe conoce_respuestas.</li>
              </ol>
            </div>
          ) : null}

          {isMissingServiceRoleConfigError(loadError) ? (
            <p className="mt-3 border-t border-zinc-600/60 pt-3 text-xs text-zinc-300">
              Falta configurar en el servidor la clave privilegiada de Supabase
              (service role) y la URL del proyecto; después hay que reiniciar la
              aplicación.
            </p>
          ) : null}

          {isInvalidSupabaseApiKeyError(loadError) ? (
            <div className="mt-3 space-y-2 border-t border-zinc-600/60 pt-3 text-xs text-zinc-300">
              <p>
                La clave <AdminCode>service_role</AdminCode> no es válida para este
                proyecto (copia incompleta, clave antigua o equivocada con la{" "}
                <AdminCode>anon</AdminCode>).
              </p>
              <p>
                En Supabase → Settings → API, copia de nuevo{" "}
                <strong className="text-zinc-200">service_role</strong> (secreta) a{" "}
                <AdminCode>SUPABASE_SERVICE_ROLE_KEY</AdminCode> en el servidor,
                guarda y reinicia la app.
              </p>
            </div>
          ) : null}

          {!isConoceTableOrSchemaError(loadError) &&
          !isMissingServiceRoleConfigError(loadError) &&
          !isInvalidSupabaseApiKeyError(loadError) ? (
            <p className="mt-3 border-t border-zinc-600/60 pt-3 text-xs text-zinc-400">
              Si acabas de cambiar la configuración del servidor, reinícialo. Si el
              problema continúa, revisa la base de datos y las migraciones del
              proyecto.
            </p>
          ) : null}
        </AdminErrorFrame>
      ) : null}

      {!loadError && rows.length === 0 ? (
        <AdminEmptyState
          title="Aún no hay respuestas"
          description="Cuando los usuarios guarden notas en Conocer al compañero con sesión iniciada, aparecerán aquí."
          code="conoce_respuestas"
        />
      ) : null}

      {rows.length > 0 ? (
        <AdminTableWrap>
          <table className="w-full min-w-[760px] text-left text-sm">
            <AdminTableThead>
              <AdminTh>Correo</AdminTh>
              <AdminTh>Nombre</AdminTh>
              <AdminTh>Semana</AdminTh>
              <AdminTh>Bloque</AdminTh>
              <AdminTh>Actualizado</AdminTh>
              <AdminTh className="min-w-[260px]">Respuestas</AdminTh>
            </AdminTableThead>
            <tbody>
              {rows.map((r) => (
                <AdminTr key={r.id}>
                  <AdminTd className="font-mono text-xs text-zinc-200">
                    {r.email ?? "—"}
                  </AdminTd>
                  <AdminTd className="font-medium text-zinc-200">
                    {r.displayName ?? "—"}
                  </AdminTd>
                  <AdminTd>
                    <AdminWeekPill ymd={r.weekLunesYmd} />
                  </AdminTd>
                  <AdminTd className="max-w-[200px] text-xs leading-snug text-zinc-300">
                    {r.activityLabel}
                  </AdminTd>
                  <AdminTd className="whitespace-nowrap text-xs tabular-nums text-zinc-500">
                    {new Date(r.updatedAt).toLocaleString("es-MX")}
                  </AdminTd>
                  <AdminTd>
                    <ul className="space-y-2">
                      {Object.keys(r.answers)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((k) => (
                          <li
                            key={k}
                            className="rounded-xl border border-zinc-700/60 bg-zinc-900/50 py-2.5 pl-3 pr-3 shadow-sm ring-1 ring-zinc-600/40"
                          >
                            <span className="text-[0.65rem] font-bold uppercase tracking-wide text-zinc-400">
                              Pregunta {k}
                            </span>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-200">
                              {r.answers[k]?.trim() || "—"}
                            </p>
                          </li>
                        ))}
                    </ul>
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </table>
        </AdminTableWrap>
      ) : null}

      {rows.length > 0 ? (
        <p className="mt-4 text-center text-xs text-zinc-500">
          {rows.length} {rows.length === 1 ? "registro" : "registros"}
        </p>
      ) : null}
    </div>
  );
}
