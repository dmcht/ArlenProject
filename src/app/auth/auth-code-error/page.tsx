import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-950 to-black px-4">
      <div className="max-w-md rounded-2xl border border-zinc-700/80 bg-zinc-900/60 p-8 text-center shadow-xl ring-1 ring-zinc-600/40">
        <h1 className="text-lg font-bold text-zinc-50">
          No se pudo completar el inicio de sesión
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          El enlace puede haber caducado o ser inválido. Vuelve a intentarlo
          desde la página de acceso.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-md hover:from-zinc-200 hover:via-white hover:to-zinc-300"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
