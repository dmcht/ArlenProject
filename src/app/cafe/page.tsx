import Link from "next/link";
import { NotificationsBell } from "@/components/conecta-platino/notifications-bell";
import { getCafePosts } from "@/lib/conecta/get-cafe-posts";
import { getNotificationsForUser } from "@/lib/conecta/get-notifications";
import { createClient } from "@/lib/supabase/server";
import { CafeClient } from "./cafe-client";

export const dynamic = "force-dynamic";

export default async function CafePage() {
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
    supabase && user
      ? await getCafePosts(supabase)
      : { posts: [], loadError: null };

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
                initialItems={notifications.items}
                initialUnreadCount={notifications.unreadCount}
              />
            </div>
          ) : null}
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-zinc-50 sm:text-[1.65rem]">
          Café de conexión
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-400">
          Comparte una foto de tu encuentro: se muestra como una publicación en
          el muro para que el equipo celebre esos momentos.
        </p>
        <div className="mt-8">
          <CafeClient
            key={posts.map((p) => p.id).join(",") || "sin-posts"}
            posts={posts}
            loadError={loadError}
            isAuthenticated={!!user}
            currentUserId={user?.id ?? null}
          />
        </div>
      </div>
    </div>
  );
}
