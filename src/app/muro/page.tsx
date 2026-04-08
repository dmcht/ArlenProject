import Link from "next/link";
import { NotificationsBell } from "@/components/conecta-platino/notifications-bell";
import { getMuroFeed } from "@/lib/conecta/get-muro-feed";
import { getNotificationsForUser } from "@/lib/conecta/get-notifications";
import { createClient } from "@/lib/supabase/server";
import { MuroClient } from "./muro-client";

export const dynamic = "force-dynamic";

export default async function MuroPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    supabase = null;
  }

  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;

  const { posts, loadError } =
    supabase && user ? await getMuroFeed(supabase) : { posts: [], loadError: null };

  const notifications =
    supabase && user
      ? await getNotificationsForUser(supabase, user.id)
      : { items: [], unreadCount: 0 };

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 via-neutral-950 to-black px-4 py-8 pb-14 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
          <Link
            href="/"
            className="min-w-0 flex-1 text-sm font-semibold leading-snug text-zinc-400 underline-offset-4 hover:text-white hover:underline"
          >
            <span className="sm:hidden">← Inicio</span>
            <span className="hidden sm:inline">← Volver al inicio</span>
          </Link>
          {user ? (
            <div className="shrink-0">
              <NotificationsBell
                userId={user.id}
                initialItems={notifications.items}
                initialUnreadCount={notifications.unreadCount}
              />
            </div>
          ) : null}
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-zinc-50 sm:text-[1.65rem]">
          Muro para compartir
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-400">
          Un espacio para reflexiones y pensamientos. Lee lo que comparte el
          equipo y deja un comentario para seguir la conversación.
        </p>
        <div className="mt-8">
          <MuroClient
            key={posts.map((p) => p.id).join(",") || "vacío"}
            posts={posts}
            loadError={loadError}
            isAuthenticated={!!user}
          />
        </div>
      </div>
    </div>
  );
}
