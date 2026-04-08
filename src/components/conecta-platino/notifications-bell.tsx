"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { NotificationPublic } from "@/lib/conecta/get-notifications";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/conecta/notification-actions";

function hrefForNotification(n: NotificationPublic): string {
  if (n.cafePostId) {
    return `/cafe#cafe-post-${n.cafePostId}`;
  }
  return "/cafe";
}

export function NotificationsBell({
  userId,
  initialItems,
  initialUnreadCount,
}: {
  userId: string;
  initialItems: NotificationPublic[];
  initialUnreadCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const scheduleRefresh = () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        router.refresh();
      }, 200);
    };

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          scheduleRefresh();
        },
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

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

  const markAll = useCallback(() => {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }, [router]);

  const badge =
    initialUnreadCount > 0
      ? initialUnreadCount > 9
        ? "9+"
        : String(initialUnreadCount)
      : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center rounded-full border border-zinc-600/80 bg-zinc-900/90 text-zinc-300 shadow-sm ring-1 ring-zinc-500/30 backdrop-blur-sm hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400/50 sm:h-10 sm:min-h-0 sm:w-10 sm:min-w-0"
        aria-expanded={open}
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {badge ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[0.6rem] font-bold text-white ring-2 ring-zinc-900">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="z-[60] flex max-h-[min(70dvh,22rem)] w-full flex-col overflow-hidden rounded-xl border border-zinc-600/90 bg-zinc-900/98 py-2 shadow-2xl shadow-black/50 ring-1 ring-zinc-500/40 backdrop-blur-md max-sm:fixed max-sm:left-[max(0.75rem,env(safe-area-inset-left,0px))] max-sm:right-[max(0.75rem,env(safe-area-inset-right,0px))] max-sm:top-[max(4.5rem,calc(env(safe-area-inset-top,0px)+3rem))] max-sm:max-h-[min(65dvh,calc(100dvh-5.5rem))] sm:absolute sm:right-0 sm:top-[calc(100%+0.35rem)] sm:w-[min(calc(100vw-1rem),20rem)] sm:max-w-[min(calc(100vw-1rem),20rem)]"
          role="menu"
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-700/70 px-3 pb-2">
            <p className="min-w-0 text-xs font-bold uppercase tracking-wide text-zinc-300">
              Notificaciones
            </p>
            {initialUnreadCount > 0 ? (
              <button
                type="button"
                disabled={pending}
                onClick={markAll}
                className="shrink-0 rounded-md px-1 py-2 text-[0.65rem] font-semibold text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200 disabled:opacity-50 sm:py-1"
              >
                Marcar leídas
              </button>
            ) : null}
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-1 [-webkit-overflow-scrolling:touch]">
            {initialItems.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-zinc-500">
                No hay notificaciones todavía.
              </li>
            ) : (
              initialItems.map((n) => {
                const when = formatDistanceToNow(new Date(n.createdAt), {
                  addSuffix: true,
                  locale: es,
                });
                const unread = n.readAt == null;
                return (
                  <li key={n.id}>
                    <Link
                      href={hrefForNotification(n)}
                      onClick={(e) => {
                        e.preventDefault();
                        const target = hrefForNotification(n);
                        startTransition(async () => {
                          if (unread) {
                            await markNotificationRead(n.id);
                          }
                          setOpen(false);
                          router.refresh();
                          window.location.assign(target);
                        });
                      }}
                      className={`block min-h-[44px] px-3 py-3 text-left transition active:bg-zinc-800 sm:min-h-0 sm:py-2.5 ${
                        unread ? "bg-zinc-800/40" : ""
                      } hover:bg-zinc-800/80`}
                    >
                      <p className="break-words text-sm leading-snug text-zinc-100">
                        {n.title}
                      </p>
                      <p className="mt-1 text-[0.65rem] text-zinc-500">
                        {when}
                      </p>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
