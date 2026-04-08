import Image from "next/image";
import type { NotificationPublic } from "@/lib/conecta/get-notifications";
import { HeaderAccountMenu } from "./header-account-menu";
import { NotificationsBell } from "./notifications-bell";

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
  avatarUrl = null,
  displayName = "Usuario",
  notifications = null,
}: {
  userEmail: string | null;
  avatarUrl?: string | null;
  displayName?: string;
  notifications?: {
    items: NotificationPublic[];
    unreadCount: number;
  } | null;
}) {
  return (
    <header className="relative px-4 pb-7 pt-9 sm:px-5">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950" />
        <PlatinumGlow className="left-[5%] top-4 h-24 w-40" />
        <PlatinumGlow className="right-[8%] top-12 h-20 w-32 opacity-80" />
      </div>

      <div className="absolute right-2 top-3 z-30 flex items-start gap-2 sm:right-4">
        {userEmail && notifications ? (
          <NotificationsBell
            initialItems={notifications.items}
            initialUnreadCount={notifications.unreadCount}
          />
        ) : null}
        <HeaderAccountMenu
          userEmail={userEmail}
          avatarUrl={avatarUrl}
          displayName={displayName}
        />
      </div>

      <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
        <div className="relative mb-4 flex justify-center">
          <Image
            src="/transportes-platino-logo.png"
            alt="Transportes Platino"
            width={1024}
            height={512}
            className="h-20 w-auto max-w-[min(100%,26rem)] object-contain sm:h-28"
            priority
          />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-[1.75rem]">
          Platino Conecta
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
