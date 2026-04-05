"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "magic";

export function LoginForm() {
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
    router.push("/");
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
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200 sm:p-8">
      <div className="mb-6 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 transition ${mode === "signin" ? "bg-white text-sky-700 shadow-sm" : "text-slate-600"}`}
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
          className={`flex-1 rounded-lg py-2 transition ${mode === "signup" ? "bg-white text-sky-700 shadow-sm" : "text-slate-600"}`}
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
          className={`flex-1 rounded-lg py-2 transition ${mode === "magic" ? "bg-white text-sky-700 shadow-sm" : "text-slate-600"}`}
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
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      {mode === "signin" ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none ring-sky-500/30 focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none ring-sky-500/30 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
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
              className="mb-1 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none ring-sky-500/30 focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="email-su"
              className="mb-1 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none ring-sky-500/30 focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="password-su"
              className="mb-1 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none ring-sky-500/30 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500">Mínimo 6 caracteres.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      ) : null}

      {mode === "magic" ? (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <p className="text-sm text-slate-600">
            Te enviamos un enlace mágico sin contraseña. Usa el mismo correo con
            el que te registraste.
          </p>
          <div>
            <label
              htmlFor="email-mg"
              className="mb-1 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none ring-sky-500/30 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/" className="font-medium text-sky-700 hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
