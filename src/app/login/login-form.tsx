"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "magic";

export function LoginForm({
  redirectAfterLogin = "/",
}: {
  /** Ruta interna tras entrar con contraseña (ej. /admin) */
  redirectAfterLogin?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(redirectAfterLogin);
    router.refresh();
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: fullName.trim() || undefined },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage(
      "Revisa tu correo: si la confirmación está activada, abre el enlace para activar la cuenta. Luego podrás entrar con tu contraseña.",
    );
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Te enviamos un enlace a tu correo. Ábrelo para entrar.");
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-700/80 bg-zinc-900/70 p-6 shadow-xl shadow-black/40 ring-1 ring-zinc-600/50 backdrop-blur-sm sm:p-8">
      <div className="mb-6 flex rounded-xl bg-zinc-950/80 p-1 text-sm font-semibold ring-1 ring-zinc-700/60">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 transition ${mode === "signin" ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-600/80" : "text-zinc-500"}`}
          onClick={() => {
            setMode("signin");
            setError(null);
            setMessage(null);
          }}
        >
          Entrar
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 transition ${mode === "signup" ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-600/80" : "text-zinc-500"}`}
          onClick={() => {
            setMode("signup");
            setError(null);
            setMessage(null);
          }}
        >
          Registro
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 transition ${mode === "magic" ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-600/80" : "text-zinc-500"}`}
          onClick={() => {
            setMode("magic");
            setError(null);
            setMessage(null);
          }}
        >
          Enlace
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-lg border border-zinc-600/50 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200">
          {message}
        </p>
      ) : null}

      {mode === "signin" ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-600 bg-zinc-950/50 px-3 py-2.5 text-zinc-100 outline-none ring-zinc-400/40 placeholder:text-zinc-500 focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-600 bg-zinc-950/50 px-3 py-2.5 text-zinc-100 outline-none ring-zinc-400/40 placeholder:text-zinc-500 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 py-3 text-sm font-semibold text-zinc-950 shadow-md shadow-black/30 hover:from-zinc-200 hover:via-white hover:to-zinc-300 disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      ) : null}

      {mode === "signup" ? (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Nombre (opcional)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-zinc-600 bg-zinc-950/50 px-3 py-2.5 text-zinc-100 outline-none ring-zinc-400/40 placeholder:text-zinc-500 focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="email-su"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Correo
            </label>
            <input
              id="email-su"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-600 bg-zinc-950/50 px-3 py-2.5 text-zinc-100 outline-none ring-zinc-400/40 placeholder:text-zinc-500 focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="password-su"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Contraseña
            </label>
            <input
              id="password-su"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-600 bg-zinc-950/50 px-3 py-2.5 text-zinc-100 outline-none ring-zinc-400/40 placeholder:text-zinc-500 focus:ring-2"
            />
            <p className="mt-1 text-xs text-zinc-500">Mínimo 6 caracteres.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 py-3 text-sm font-semibold text-zinc-950 shadow-md shadow-black/30 hover:from-zinc-200 hover:via-white hover:to-zinc-300 disabled:opacity-60"
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      ) : null}

      {mode === "magic" ? (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <p className="text-sm text-zinc-400">
            Te enviamos un enlace mágico sin contraseña. Usa el mismo correo con
            el que te registraste.
          </p>
          <div>
            <label
              htmlFor="email-mg"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Correo
            </label>
            <input
              id="email-mg"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-600 bg-zinc-950/50 px-3 py-2.5 text-zinc-100 outline-none ring-zinc-400/40 placeholder:text-zinc-500 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-zinc-500 bg-zinc-800 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-700 disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      ) : null}

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/" className="font-medium text-zinc-300 hover:text-white hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
