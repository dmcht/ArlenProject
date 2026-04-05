import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  CICLO_LUNES_COOKIE,
  getCicloLunesCookieValueForFirstVisit,
} from "@/lib/conecta/semanal-week";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let url: string;
  let key: string;
  try {
    ({ url, key } = getSupabasePublicConfig());
  } catch {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([h, v]) =>
          supabaseResponse.headers.set(h, v),
        );
      },
    },
  });

  await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const cicloFijo = Boolean(process.env.ACTIVIDAD_SEMANAL_INICIO?.trim());
  if (
    path.startsWith("/actividad") &&
    !cicloFijo &&
    !request.cookies.get(CICLO_LUNES_COOKIE)
  ) {
    const value = getCicloLunesCookieValueForFirstVisit();
    supabaseResponse.cookies.set(CICLO_LUNES_COOKIE, value, {
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      sameSite: "lax",
    });
  }

  return supabaseResponse;
}
