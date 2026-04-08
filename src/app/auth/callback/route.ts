import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  } catch {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
