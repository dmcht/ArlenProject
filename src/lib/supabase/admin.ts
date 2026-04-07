import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service role: solo en servidor, nunca importar en componentes cliente.
 * Omite RLS; úsalo solo tras comprobar que el usuario es administrador.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "La configuración del panel administrativo en el servidor está incompleta: hace falta la URL del proyecto y la clave privilegiada de la API (Supabase → Settings → API).",
    );
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
