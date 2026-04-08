import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/conecta/admin-auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Administración | Platino Conecta",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login?next=/admin");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?next=/admin");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-neutral-950 to-black">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 shadow-sm backdrop-blur-md">
        <nav
          className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 gap-y-2 px-4 py-3 sm:gap-3"
          aria-label="Administración"
        >
          <Link
            href="/admin"
            className="rounded-lg px-2 py-1 text-base font-bold tracking-tight text-zinc-100 transition hover:bg-zinc-800"
          >
            Panel admin
          </Link>
          <span className="hidden h-4 w-px bg-zinc-700 sm:block" aria-hidden />
          <Link
            href="/admin/conoce"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            Conoce al compañero
          </Link>
          <Link
            href="/admin/actividad-semanal"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            Actividad semanal
          </Link>
          <Link
            href="/"
            className="ml-auto rounded-full px-3 py-1.5 text-sm font-medium text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
          >
            ← Inicio
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 pb-16 sm:px-6">{children}</main>
    </div>
  );
}
