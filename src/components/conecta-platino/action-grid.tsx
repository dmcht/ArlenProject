import type { ReactNode } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Coffee,
  Heart,
  HelpCircle,
  MessageCircle,
  MessagesSquare,
  UserRound,
} from "lucide-react";

type Card = {
  href: string;
  title: string;
  gradient: string;
  icon: ReactNode;
};

const iconStroke = 1.75;

const cards: Card[] = [
  {
    href: "/conoce",
    title: "Conoce a un Compañero",
    gradient:
      "from-zinc-600 via-zinc-500 to-zinc-800 shadow-black/40 hover:shadow-black/50",
    icon: (
      <div className="relative flex h-8 w-8 items-center justify-center text-white">
        <UserRound className="h-7 w-7" strokeWidth={iconStroke} aria-hidden />
        <MessageCircle
          className="absolute -bottom-px -right-px h-4 w-4"
          strokeWidth={iconStroke}
          aria-hidden
        />
      </div>
    ),
  },
  {
    href: "/cafe",
    title: "Café de Conexión",
    gradient:
      "from-neutral-500 via-zinc-400 to-neutral-700 shadow-black/35 hover:shadow-black/45",
    icon: (
      <div className="flex items-end gap-1 text-white">
        <Coffee className="h-6 w-6" strokeWidth={iconStroke} aria-hidden />
        <Coffee
          className="h-5 w-5 opacity-90"
          strokeWidth={iconStroke}
          aria-hidden
        />
      </div>
    ),
  },
  {
    href: "/actividad",
    title: "Actividad Semanal",
    gradient:
      "from-zinc-700 via-neutral-600 to-zinc-900 shadow-black/45 hover:shadow-black/55",
    icon: (
      <div className="relative flex h-8 w-8 items-center justify-center text-white">
        <ClipboardList className="h-7 w-7" strokeWidth={iconStroke} aria-hidden />
        <HelpCircle
          className="absolute -right-1 -top-1 h-3.5 w-3.5"
          strokeWidth={2}
          aria-hidden
        />
      </div>
    ),
  },
  {
    href: "/muro",
    title: "Muro para Compartir",
    gradient:
      "from-neutral-600 via-zinc-500 to-neutral-800 shadow-black/40 hover:shadow-black/50",
    icon: (
      <div className="relative flex h-8 w-8 items-center justify-center text-white">
        <MessagesSquare className="h-7 w-7" strokeWidth={iconStroke} aria-hidden />
        <Heart
          className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-white/35"
          strokeWidth={iconStroke}
          aria-hidden
        />
      </div>
    ),
  },
];

export function ActionGrid() {
  return (
    <nav
      className="relative z-10 -mt-3 grid w-full grid-cols-2 gap-3 sm:-mt-4"
      aria-label="Acciones principales"
    >
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className={`group flex min-h-[108px] flex-col items-center justify-center gap-2.5 rounded-[1.35rem] bg-gradient-to-br px-2.5 py-3.5 text-center shadow-md ring-1 ring-white/15 transition hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] ${card.gradient}`}
        >
          <span className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/25">
            {card.icon}
          </span>
          <span className="text-[0.8125rem] font-bold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
            {card.title}
          </span>
        </Link>
      ))}
    </nav>
  );
}
