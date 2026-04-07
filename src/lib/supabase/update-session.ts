import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/conecta/admin-auth";
import {
  CICLO_LUNES_COOKIE,
  getCicloLunesCookieValueForFirstVisit,
} from "@/lib/conecta/semanal-week";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

/** Rutas accesibles sin sesión (inicio, login y flujo OAuth). */
function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/login") return true;
  if (pathname.startsWith("/auth/")) return true;
  return false;
}

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
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, cache: "no-store" }),
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin")) {
    if (!user?.email) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
      loginUrl.searchParams.set("next", returnTo);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdminEmail(user.email)) {
      const home = request.nextUrl.clone();
      home.pathname = "/";
      home.search = "";
      return NextResponse.redirect(home);
    }
  }

  if (!isPublicPath(path) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("next", returnTo);
    return NextResponse.redirect(loginUrl);
  }

  const cicloFijo = Boolean(process.env.ACTIVIDAD_SEMANAL_INICIO?.trim());
  if (
    (path.startsWith("/actividad") || path.startsWith("/conoce")) &&
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
