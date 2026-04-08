import {
  AdminBadge,
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
  isInvalidSupabaseApiKeyError,
  isMissingServiceRoleConfigError,
  isSemanalEleccionesTableOrSchemaError,
} from "@/lib/conecta/admin/admin-load-messages";
import { loadSemanalEleccionesForAdmin } from "@/lib/conecta/admin/load-semanal-elecciones";

export const dynamic = "force-dynamic";

export default async function AdminActividadSemanalPage() {
  let rows: Awaited<ReturnType<typeof loadSemanalEleccionesForAdmin>>;
  let loadError: string | null = null;

  try {
    rows = await loadSemanalEleccionesForAdmin();
  } catch (e) {
    rows = [];
    loadError = e instanceof Error ? e.message : "No se pudieron cargar los datos.";
  }

  return (
    <div className="space-y-2">
      <AdminHero
        title="Actividad semanal"
        subtitle="Una fila por usuario y semana (lunes ISO): situación del ciclo y opción elegida en la app."
      />

      {loadError ? (
        <AdminErrorFrame>
          <p className="font-semibold text-zinc-100">No se pudo leer la base de datos</p>

          {isSemanalEleccionesTableOrSchemaError(loadError) ? (
            <div className="mt-3 space-y-2 border-t border-zinc-600/60 pt-3 text-xs text-zinc-300">
              <p>
                Revisa la tabla{" "}
                <AdminCode>public.semanal_elecciones</AdminCode>{" "}
                y el esquema de PostgREST.
              </p>
              <ol className="list-decimal space-y-1.5 pl-5 leading-relaxed">
                <li>
                  Ejecuta{" "}
                  <AdminCode>
                    supabase/migrations/20260413120000_semanal_elecciones.sql
                  </AdminCode>
                  .
                </li>
                <li>
                  <AdminCode>{`select pg_notify('pgrst', 'reload schema');`}</AdminCode>
                </li>
              </ol>
            </div>
          ) : null}

          {isMissingServiceRoleConfigError(loadError) ? (
            <p className="mt-3 border-t border-zinc-600/60 pt-3 text-xs text-zinc-300">
              Falta configurar en el servidor la clave privilegiada de Supabase y
              reiniciar la aplicación.
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

          {!isSemanalEleccionesTableOrSchemaError(loadError) &&
          !isMissingServiceRoleConfigError(loadError) &&
          !isInvalidSupabaseApiKeyError(loadError) ? (
            <p className="mt-3 border-t border-zinc-600/60 pt-3 text-xs text-zinc-400">
              Si acabas de cambiar la configuración del servidor, reinícialo.
            </p>
          ) : null}
        </AdminErrorFrame>
      ) : null}

      {!loadError && rows.length === 0 ? (
        <AdminEmptyState
          title="Aún no hay elecciones"
          description="Las respuestas de Actividad semanal con sesión iniciada se guardan por semana y aparecerán aquí."
          code="semanal_elecciones"
        />
      ) : null}

      {rows.length > 0 ? (
        <AdminTableWrap>
          <table className="w-full min-w-[820px] text-left text-sm">
            <AdminTableThead>
              <AdminTh>Correo</AdminTh>
              <AdminTh>Nombre</AdminTh>
              <AdminTh>Semana</AdminTh>
              <AdminTh>Actividad</AdminTh>
              <AdminTh className="min-w-[200px]">Opción elegida</AdminTh>
              <AdminTh>Clima</AdminTh>
              <AdminTh>Actualizado</AdminTh>
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
                  <AdminTd className="max-w-[240px] text-xs leading-snug text-zinc-300">
                    {r.activityLabel}
                  </AdminTd>
                  <AdminTd>
                    <span className="inline-block max-w-[280px] text-zinc-200">
                      {r.chosenText}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    {r.recomendada ? (
                      <AdminBadge variant="success">Opción recomendada</AdminBadge>
                    ) : (
                      <AdminBadge variant="muted">Otra opción</AdminBadge>
                    )}
                  </AdminTd>
                  <AdminTd className="whitespace-nowrap text-xs tabular-nums text-zinc-500">
                    {new Date(r.updatedAt).toLocaleString("es-MX")}
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
