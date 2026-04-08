"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProfileAvatarSection } from "./profile-avatar-section";
import { UserAvatar } from "./user-avatar";

export function HeaderAccountMenu({
  userEmail,
  avatarUrl,
  displayName,
}: {
  userEmail: string | null;
  avatarUrl: string | null;
  displayName: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | PointerEvent) {
      const el = rootRef.current;
      if (!el?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!userEmail) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-zinc-600/80 bg-zinc-900/90 px-3 py-1 text-[0.65rem] font-semibold text-zinc-100 shadow-sm ring-1 ring-zinc-500/30 backdrop-blur-sm hover:bg-zinc-800 sm:text-xs"
      >
        Entrar
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full border border-zinc-600/80 bg-zinc-900/90 p-0.5 pl-0.5 shadow-sm ring-1 ring-zinc-500/30 backdrop-blur-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menú de cuenta"
      >
        <UserAvatar avatarUrl={avatarUrl} label={displayName} size="md" />
        <span className="pr-1.5 text-[0.6rem] text-zinc-400" aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.35rem)] z-50 w-[min(calc(100vw-1.5rem),18rem)] rounded-xl border border-zinc-600/90 bg-zinc-900/98 py-3 shadow-2xl shadow-black/50 ring-1 ring-zinc-500/40 backdrop-blur-md"
          role="menu"
        >
          <div className="border-b border-zinc-700/70 px-3 pb-3">
            <p className="truncate text-[0.65rem] font-medium text-zinc-400 sm:text-xs">
              {userEmail}
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-zinc-200">
              {displayName}
            </p>
          </div>

          <div className="px-3 pt-3">
            <ProfileAvatarSection
              variant="menu"
              avatarUrl={avatarUrl}
              displayLabel={displayName}
              onAvatarUpdated={closeMenu}
            />
          </div>

          <div className="mt-2 border-t border-zinc-700/70 px-3 pt-3">
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="w-full rounded-lg border border-zinc-600/80 bg-zinc-800/80 py-2 text-xs font-semibold text-zinc-100 hover:bg-zinc-700"
                role="menuitem"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
