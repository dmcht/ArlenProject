import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sky-100 px-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
        <h1 className="text-lg font-bold text-slate-800">
          No se pudo completar el inicio de sesión
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          El enlace puede haber caducado o ser inválido. Vuelve a intentarlo
          desde la página de acceso.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
