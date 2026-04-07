import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | Conecta Platino",
  description: "Accede a Conecta Platino",
};

function safeRedirectNext(raw: string | undefined): string | undefined {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = safeRedirectNext(sp.next);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-950 via-neutral-950 to-black px-4 py-10">
      <Link
        href="/"
        className="mb-6 text-sm font-semibold text-zinc-400 hover:text-white hover:underline"
      >
        ← Conecta Platino
      </Link>
      <LoginForm redirectAfterLogin={next ?? "/"} />
    </div>
  );
}
