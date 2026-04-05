import Link from "next/link";

export default function CafePage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-amber-50 to-white px-6 py-10">
      <Link
        href="/"
        className="text-sm font-semibold text-amber-800 underline-offset-4 hover:underline"
      >
        ← Volver al inicio
      </Link>
      <h1 className="mt-6 text-2xl font-bold text-slate-800">Café de Conexión</h1>
      <p className="mt-2 text-slate-600">Contenido próximamente.</p>
    </div>
  );
}
