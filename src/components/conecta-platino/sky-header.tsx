import Link from "next/link";

function Cloud({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full bg-white/70 blur-[0.5px] ${className ?? ""}`}
      aria-hidden
    />
  );
}

export function SkyHeader({
  userEmail,
}: {
  userEmail: string | null;
}) {
  return (
    <header className="relative overflow-hidden px-4 pb-7 pt-9 sm:px-5">
      <div
        className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100"
        aria-hidden
      />
      <Cloud className="left-[8%] top-6 h-10 w-20 opacity-90" />
      <Cloud className="right-[12%] top-10 h-8 w-16 opacity-80" />
      <Cloud className="left-1/2 top-16 h-6 w-14 -translate-x-1/2 opacity-70" />

      <div className="absolute right-2 top-3 z-20 flex max-w-[min(12rem,calc(100%-1rem))] flex-col items-end gap-1 sm:right-4">
        {userEmail ? (
          <>
            <span className="truncate text-[0.65rem] font-medium text-sky-900/80 sm:text-xs">
              {userEmail}
            </span>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="rounded-full bg-white/80 px-3 py-1 text-[0.65rem] font-semibold text-sky-800 shadow-sm ring-1 ring-sky-200/80 hover:bg-white sm:text-xs"
              >
                Salir
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-white/80 px-3 py-1 text-[0.65rem] font-semibold text-sky-800 shadow-sm ring-1 ring-sky-200/80 hover:bg-white sm:text-xs"
          >
            Entrar
          </Link>
        )}
      </div>

      <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
        <div className="relative mb-4 h-16 w-28">
          <span className="absolute left-2 top-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md ring-4 ring-white/60">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </span>
          <span className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md ring-4 ring-white/60">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </span>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-sky-700 drop-shadow-sm sm:text-[1.75rem]">
          Conecta Platino
        </h1>
        <p className="mt-1 text-sm font-semibold text-sky-800/90">
          Comunicación que nos une
        </p>
        <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-sky-900/80">
          Fortalezcamos nuestras relaciones cada semana.
        </p>
      </div>
    </header>
  );
}
