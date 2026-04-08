/**
 * Textos de ayuda cuando falla la carga del panel admin (servidor).
 */

export function isConoceTableOrSchemaError(message: string): boolean {
  const m = message.toLowerCase();
  if (m.includes("pgrst205")) return true;
  if (m.includes("schema cache") && m.includes("conoce_respuestas")) return true;
  if (m.includes("could not find the table") && m.includes("conoce_respuestas"))
    return true;
  return false;
}

export function isSemanalEleccionesTableOrSchemaError(message: string): boolean {
  const m = message.toLowerCase();
  if (m.includes("pgrst205")) return true;
  if (m.includes("schema cache") && m.includes("semanal_elecciones")) return true;
  if (m.includes("could not find the table") && m.includes("semanal_elecciones"))
    return true;
  return false;
}

export function isMissingServiceRoleConfigError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("panel administrativo en el servidor está incompleta") ||
    m.includes("supabase_service_role_key") ||
    m.includes("configura supabase_service_role")
  );
}

/** Clave errónea o corrupta (p. ej. copia incompleta); PostgREST responde "Invalid API key". */
export function isInvalidSupabaseApiKeyError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("invalid api key") ||
    m.includes("jwt could not be decoded") ||
    (m.includes("jwt") && m.includes("invalid"))
  );
}
