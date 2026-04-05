import Link from "next/link";

export default function ConocePage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-sky-100 to-white px-6 py-10">
      <Link
        href="/"
        className="text-sm font-semibold text-sky-700 underline-offset-4 hover:underline"
      >
        ← Volver al inicio
      </Link>
      <h1 className="mt-6 text-2xl font-bold text-slate-800">
        Conoce a un Compañero
      </h1>
      <p className="mt-2 text-slate-600">Contenido próximamente.</p>
    </div>
  );
}
