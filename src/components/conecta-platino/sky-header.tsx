import Image from "next/image";
import Link from "next/link";

function PlatinumGlow({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full bg-gradient-to-br from-zinc-400/25 via-zinc-500/10 to-transparent blur-2xl ${className ?? ""}`}
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
        className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950"
        aria-hidden
      />
      <PlatinumGlow className="left-[5%] top-4 h-24 w-40" />
      <PlatinumGlow className="right-[8%] top-12 h-20 w-32 opacity-80" />

      <div className="absolute right-2 top-3 z-20 flex max-w-[min(12rem,calc(100%-1rem))] flex-col items-end gap-1 sm:right-4">
        {userEmail ? (
          <>
            <span className="truncate text-[0.65rem] font-medium text-zinc-400 sm:text-xs">
              {userEmail}
            </span>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="rounded-full border border-zinc-600/80 bg-zinc-900/90 px-3 py-1 text-[0.65rem] font-semibold text-zinc-100 shadow-sm ring-1 ring-zinc-500/30 backdrop-blur-sm hover:bg-zinc-800 sm:text-xs"
              >
                Salir
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full border border-zinc-600/80 bg-zinc-900/90 px-3 py-1 text-[0.65rem] font-semibold text-zinc-100 shadow-sm ring-1 ring-zinc-500/30 backdrop-blur-sm hover:bg-zinc-800 sm:text-xs"
          >
            Entrar
          </Link>
        )}
      </div>

      <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
        <div className="relative mb-4 flex justify-center">
          <Image
            src="/grupo-platino-logo.png"
            alt="Grupo Platino"
            width={220}
            height={88}
            className="h-16 w-auto max-w-[min(100%,16rem)] object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-[1.75rem]">
          Conecta Platino
        </h1>
        <p className="mt-1 text-sm font-semibold text-zinc-300">
          Comunicación que nos une
        </p>
        <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-zinc-400">
          Fortalezcamos nuestras relaciones cada semana.
        </p>
      </div>
    </header>
  );
}
