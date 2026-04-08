"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const MAX_POST = 4000;
const MAX_COMMENT = 1500;

async function authorRowForMuro(
  supabase: SupabaseClient,
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

export async function createMuroPost(bodyRaw: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const body = bodyRaw.trim();
  if (body.length < 1) {
    return { ok: false, error: "Escribe tu reflexión." };
  }
  if (body.length > MAX_POST) {
    return { ok: false, error: `Máximo ${MAX_POST} caracteres.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Inicia sesión para publicar." };
  }

  const author = await authorRowForMuro(
    supabase,
    user.id,
    user.email ?? undefined,
  );

  const { error } = await supabase.from("muro_posts").insert({
    user_id: user.id,
    author_label: author.label,
    author_avatar_path: author.avatarPath,
    body,
  });

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.code === "PGRST204" ||
      (error.message ?? "").toLowerCase().includes("schema cache")
    ) {
      return {
        ok: false,
        error:
          "Faltan las tablas del muro en Supabase. Ejecuta supabase/migrations/20260412100000_muro_compartir.sql y recarga.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/muro");
  return { ok: true };
}

export async function createMuroComment(
  postId: string,
  bodyRaw: string,
): Promise<{ ok: boolean; error?: string }> {
  const body = bodyRaw.trim();
  if (body.length < 1) {
    return { ok: false, error: "Escribe un comentario." };
  }
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

  const author = await authorRowForMuro(
    supabase,
    user.id,
    user.email ?? undefined,
  );

  const { error } = await supabase.from("muro_comments").insert({
    post_id: postId,
    user_id: user.id,
    author_label: author.label,
    author_avatar_path: author.avatarPath,
    body,
  });

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.code === "PGRST204" ||
      (error.message ?? "").toLowerCase().includes("schema cache")
    ) {
      return {
        ok: false,
        error:
          "Faltan las tablas del muro en Supabase. Ejecuta supabase/migrations/20260412100000_muro_compartir.sql.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/muro");
  return { ok: true };
}
