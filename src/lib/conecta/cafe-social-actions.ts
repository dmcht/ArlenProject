"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_COMMENT = 1500;

async function authorRowForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | undefined,
): Promise<{ label: string; avatarPath: string | null }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_path")
    .eq("id", userId)
    .maybeSingle();
  return {
    label:
      profile?.display_name?.trim() ||
      email?.split("@")[0]?.trim() ||
      "Usuario",
    avatarPath: profile?.avatar_path ?? null,
  };
}

export async function toggleCafePostLike(postId: string): Promise<{
  ok: boolean;
  error?: string;
  liked?: boolean;
}> {
  const id = postId.trim();
  if (!id) return { ok: false, error: "Publicación no válida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Inicia sesión para reaccionar." };
  }

  const { data: existing } = await supabase
    .from("cafe_post_likes")
    .select("post_id")
    .eq("post_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cafe_post_likes")
      .delete()
      .eq("post_id", id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/cafe");
    return { ok: true, liked: false };
  }

  const { error } = await supabase.from("cafe_post_likes").insert({
    post_id: id,
    user_id: user.id,
  });
  if (error) {
    if (
      error.code === "PGRST205" ||
      (error.message ?? "").toLowerCase().includes("schema cache")
    ) {
      return {
        ok: false,
        error:
          "Faltan tablas de reacciones. Ejecuta supabase/migrations/20260417120000_cafe_likes_comments.sql en Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/cafe");
  return { ok: true, liked: true };
}

export async function addCafePostComment(
  postId: string,
  bodyRaw: string,
): Promise<{ ok: boolean; error?: string }> {
  const id = postId.trim();
  const body = bodyRaw.trim();
  if (!id) return { ok: false, error: "Publicación no válida." };
  if (body.length < 1) return { ok: false, error: "Escribe un comentario." };
  if (body.length > MAX_COMMENT) {
    return { ok: false, error: `Máximo ${MAX_COMMENT} caracteres.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Inicia sesión para comentar." };
  }

  const author = await authorRowForUser(
    supabase,
    user.id,
    user.email ?? undefined,
  );

  const { error } = await supabase.from("cafe_post_comments").insert({
    post_id: id,
    user_id: user.id,
    author_label: author.label,
    author_avatar_path: author.avatarPath,
    body,
  });

  if (error) {
    if (
      error.code === "PGRST205" ||
      (error.message ?? "").toLowerCase().includes("schema cache")
    ) {
      return {
        ok: false,
        error:
          "Faltan tablas de comentarios. Ejecuta supabase/migrations/20260417120000_cafe_likes_comments.sql en Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/cafe");
  return { ok: true };
}

export async function deleteCafePostComment(commentId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const id = commentId.trim();
  if (!id) return { ok: false, error: "Comentario no válido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Inicia sesión." };
  }

  const { error } = await supabase
    .from("cafe_post_comments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/cafe");
  return { ok: true };
}
