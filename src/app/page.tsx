export default function Home() {
  const supabaseReady =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Arlen
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Next.js (App Router), React y Supabase con pnpm. Copia{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
            .env.example
          </code>{" "}
          a{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
            .env.local
          </code>{" "}
          y pega la URL y la clave de tu proyecto.
        </p>
        <p className="mt-6 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            Supabase:
          </span>{" "}
          {supabaseReady ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              variables detectadas (cliente servidor inicializado)
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">
              configura{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
                .env.local
              </code>
            </span>
          )}
        </p>
      </main>
    </div>
  );
}
