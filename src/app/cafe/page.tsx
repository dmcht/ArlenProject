import Link from "next/link";
import { getCafePosts } from "@/lib/conecta/get-cafe-posts";
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

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 via-neutral-950 to-black px-4 py-8 pb-14 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="inline-flex text-sm font-semibold text-zinc-400 underline-offset-4 hover:text-white hover:underline"
        >
          ← Volver al inicio
        </Link>
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
