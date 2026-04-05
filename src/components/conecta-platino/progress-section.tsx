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
    className: "text-sky-600",
  },
  {
    key: "cafes",
    label: "Cafés Participados",
    icon: Coffee,
    className: "text-amber-600",
  },
  {
    key: "reconocimientos",
    label: "Reconocimientos Dados",
    icon: Star,
    className: "text-amber-500",
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
    border: "border-sky-400",
    icon: UsersRound,
    className: "text-sky-600",
  },
  {
    id: "active_listening",
    label: "Escucha Activa",
    border: "border-emerald-400",
    icon: Ear,
    className: "text-emerald-600",
  },
  {
    id: "supportive_peer",
    label: "Compañero Solidario",
    border: "border-blue-400",
    icon: Handshake,
    className: "text-blue-600",
  },
];

export function ProgressSection({ data }: { data: UserProgressPayload }) {
  const earned = new Set(data.earnedBadgeIds);

  return (
    <section className="relative z-10 w-full">
      <div className="rounded-[1.75rem] bg-white p-5 shadow-md shadow-slate-400/15 ring-1 ring-slate-200/60">
        <h2 className="mb-5 text-center text-lg font-bold text-slate-800">
          Mi Progreso
        </h2>

        {!data.isAuthenticated ? (
          <p className="mb-4 rounded-xl bg-sky-50 px-3 py-2 text-center text-xs font-medium text-sky-800">
            <Link href="/login" className="font-semibold underline underline-offset-2">
              Inicia sesión
            </Link>{" "}
            para ver y guardar tu progreso en la base de datos.
          </p>
        ) : null}

        <div className="grid grid-cols-3 gap-0">
          {STATS_META.map(({ key, label, icon: Icon, className, fillIcon }, i) => (
            <div
              key={key}
              className={`flex flex-col items-center px-1 py-1 text-center ${i > 0 ? "border-l border-slate-200" : ""}`}
            >
              <Icon
                className={`mb-1.5 h-8 w-8 ${className}`}
                strokeWidth={stroke}
                fill={fillIcon ? "currentColor" : "none"}
                aria-hidden
              />
              <span className="text-2xl font-extrabold tabular-nums text-slate-800">
                {data[key]}
              </span>
              <span className="mt-1.5 max-w-[6.5rem] text-xs font-semibold leading-snug text-slate-600">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between gap-1 border-t border-slate-100 pt-5 sm:gap-2">
          {BADGES_META.map(
            ({ id, label, border, icon: Icon, className }) => {
              const unlocked = earned.has(id);
              return (
                <div
                  key={id}
                  className="flex flex-1 flex-col items-center gap-2 text-center"
                >
                  <div
                    className={`flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-[2.5px] bg-gradient-to-b from-slate-50 to-white shadow-sm transition-opacity ${border} ${unlocked ? "" : "opacity-35"}`}
                  >
                    <Icon
                      className={`h-6 w-6 ${className}`}
                      strokeWidth={stroke}
                      aria-hidden
                    />
                  </div>
                  <span
                    className={`max-w-[5.5rem] text-[0.7rem] font-bold leading-tight sm:text-xs ${unlocked ? "text-slate-600" : "text-slate-400"}`}
                  >
                    {label}
                  </span>
                </div>
              );
            },
          )}
        </div>

        <p className="mt-5 rounded-2xl bg-sky-50/90 px-4 py-3 text-center text-sm font-medium leading-relaxed text-slate-700">
          <span className="font-bold text-sky-700">Frase del día: </span>
          <span className="italic text-slate-600">
            &ldquo;{data.quote}&rdquo;
          </span>
        </p>
      </div>
    </section>
  );
}
