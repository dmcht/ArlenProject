import type { LucideIcon } from "lucide-react";
import {
  Coffee,
  Ear,
  Handshake,
  MessagesSquare,
  Star,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { UserProgressPayload } from "@/lib/conecta/get-progress";

const stroke = 1.75;

const STATS_META: {
  key: keyof Pick<
    UserProgressPayload,
    "charlas" | "cafes" | "reconocimientos"
  >;
  label: string;
  icon: LucideIcon;
  className: string;
  fillIcon?: boolean;
}[] = [
  {
    key: "charlas",
    label: "Charlas Realizadas",
    icon: MessagesSquare,
    className: "text-zinc-300",
  },
  {
    key: "cafes",
    label: "Cafés Participados",
    icon: Coffee,
    className: "text-zinc-400",
  },
  {
    key: "reconocimientos",
    label: "Reconocimientos Dados",
    icon: Star,
    className: "text-zinc-200",
    fillIcon: true,
  },
];

const BADGES_META: {
  id: string;
  label: string;
  border: string;
  icon: LucideIcon;
  className: string;
}[] = [
  {
    id: "team_connector",
    label: "Conector del Equipo",
    border: "border-zinc-500",
    icon: UsersRound,
    className: "text-zinc-300",
  },
  {
    id: "active_listening",
    label: "Escucha Activa",
    border: "border-zinc-400",
    icon: Ear,
    className: "text-zinc-400",
  },
  {
    id: "supportive_peer",
    label: "Compañero Solidario",
    border: "border-neutral-500",
    icon: Handshake,
    className: "text-zinc-200",
  },
];

export function ProgressSection({ data }: { data: UserProgressPayload }) {
  const earned = new Set(data.earnedBadgeIds);

  return (
    <section className="relative z-10 w-full">
      <div className="rounded-[1.75rem] border border-zinc-700/80 bg-zinc-900/60 p-5 shadow-lg shadow-black/30 ring-1 ring-zinc-600/40 backdrop-blur-sm">
        <h2 className="mb-5 text-center text-lg font-bold text-zinc-50">
          Mi Progreso
        </h2>

        {!data.isAuthenticated ? (
          <p className="mb-4 rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-3 py-2 text-center text-xs font-medium text-zinc-300">
            <Link href="/login" className="font-semibold text-white underline underline-offset-2">
              Inicia sesión
            </Link>{" "}
            para ver y guardar tu progreso en la base de datos.
          </p>
        ) : null}

        <div className="grid grid-cols-3 gap-0">
          {STATS_META.map(({ key, label, icon: Icon, className, fillIcon }, i) => (
            <div
              key={key}
              className={`flex flex-col items-center px-1 py-1 text-center ${i > 0 ? "border-l border-zinc-700/80" : ""}`}
            >
              <Icon
                className={`mb-1.5 h-8 w-8 ${className}`}
                strokeWidth={stroke}
                fill={fillIcon ? "currentColor" : "none"}
                aria-hidden
              />
              <span className="text-2xl font-extrabold tabular-nums text-white">
                {data[key]}
              </span>
              <span className="mt-1.5 max-w-[6.5rem] text-xs font-semibold leading-snug text-zinc-400">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between gap-1 border-t border-zinc-700/60 pt-5 sm:gap-2">
          {BADGES_META.map(
            ({ id, label, border, icon: Icon, className }) => {
              const unlocked = earned.has(id);
              return (
                <div
                  key={id}
                  className="flex flex-1 flex-col items-center gap-2 text-center"
                >
                  <div
                    className={`flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[2.5px] bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-sm transition-opacity ${border} ${unlocked ? "" : "opacity-35"}`}
                  >
                    <Icon
                      className={`h-6 w-6 ${className}`}
                      strokeWidth={stroke}
                      aria-hidden
                    />
                  </div>
                  <span
                    className={`max-w-[5.5rem] text-[0.7rem] font-bold leading-tight sm:text-xs ${unlocked ? "text-zinc-300" : "text-zinc-600"}`}
                  >
                    {label}
                  </span>
                </div>
              );
            },
          )}
        </div>

        <p className="mt-5 rounded-2xl border border-zinc-700/50 bg-zinc-800/40 px-4 py-3 text-center text-sm font-medium leading-relaxed text-zinc-300">
          <span className="font-bold text-zinc-100">Frase del día: </span>
          <span className="italic text-zinc-400">
            &ldquo;{data.quote}&rdquo;
          </span>
        </p>
      </div>
    </section>
  );
}
