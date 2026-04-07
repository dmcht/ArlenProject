import { CalendarDays, MessageCircleHeart } from "lucide-react";
import Link from "next/link";

const cards = [
  {
    href: "/admin/conoce",
    title: "Conoce al compañero",
    description: "Notas por semana y bloque del ciclo; respuestas guardadas por usuario.",
    icon: MessageCircleHeart,
    accent: "from-zinc-500/15 to-zinc-700/25",
    iconBg: "bg-zinc-800 text-zinc-200 ring-zinc-600/80",
  },
  {
    href: "/admin/actividad-semanal",
    title: "Actividad semanal",
    description: "Opción elegida en cada situación, alineada al calendario ISO.",
    icon: CalendarDays,
    accent: "from-neutral-500/15 to-zinc-800/25",
    iconBg: "bg-zinc-800 text-zinc-200 ring-zinc-600/80",
  },
] as const;

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-[1.75rem]">
          Panel administrativo
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
          Consulta las respuestas recopiladas en cada flujo. Solo las cuentas
          autorizadas pueden entrar a este panel.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/50 p-5 shadow-lg shadow-black/25 ring-1 ring-zinc-600/40 transition hover:border-zinc-500 hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)] hover:ring-zinc-500/50`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 transition group-hover:opacity-100`}
                  aria-hidden
                />
                <div className="relative flex items-start gap-4">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${item.iconBg}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-zinc-100 group-hover:text-white">
                      {item.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                      {item.description}
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-zinc-300 group-hover:text-white">
                      Abrir informe
                      <span
                        className="ml-1 transition group-hover:translate-x-0.5"
                        aria-hidden
                      >
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

    </div>
  );
}
