"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordCafe } from "@/lib/conecta/progress-actions";

const BUCKET = "cafe-posts";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extForMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

function parseCaption(formData: FormData): string | null {
  const captionRaw = formData.get("caption");
  if (typeof captionRaw !== "string") return null;
  return captionRaw.trim().slice(0, 500) || null;
}

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

function validateImageFile(raw: unknown): { ok: true; file: File } | { ok: false; error: string } {
  if (!(raw instanceof File)) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (raw.size === 0) {
    return { ok: false, error: "El archivo está vacío." };
  }
  if (raw.size > MAX_BYTES) {
    return { ok: false, error: "La imagen debe pesar menos de 5 MB." };
  }
  const mime = raw.type.toLowerCase();
  if (!ALLOWED.has(mime)) {
    return { ok: false, error: "Formato permitido: JPG, PNG, WebP o GIF." };
  }
  return { ok: true, file: raw };
}

export async function createCafePost(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Inicia sesión para publicar." };
  }

  const raw = formData.get("image");
  if (!(raw instanceof File)) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (raw.size === 0) {
    return { ok: false, error: "El archivo está vacío." };
  }
  if (raw.size > MAX_BYTES) {
    return { ok: false, error: "La imagen debe pesar menos de 5 MB." };
  }
  const mime = raw.type.toLowerCase();
  if (!ALLOWED.has(mime)) {
    return { ok: false, error: "Formato permitido: JPG, PNG, WebP o GIF." };
  }

  const caption = parseCaption(formData);

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("display_name, avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  if (profErr) {
    return { ok: false, error: "No pudimos cargar tu perfil." };
  }

  const authorLabel =
    profile?.display_name?.trim() ||
    user.email?.split("@")[0]?.trim() ||
    "Usuario";

  const ext = extForMime(mime);
  const imagePath = `${user.id}/${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await raw.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(imagePath, bytes, {
      contentType: mime,
      upsert: false,
    });

  if (upErr) {
    return { ok: false, error: upErr.message };
  }

  const { error: insErr } = await supabase.from("cafe_posts").insert({
    user_id: user.id,
    author_label: authorLabel,
    author_avatar_path: profile?.avatar_path ?? null,
    caption,
    image_path: imagePath,
  });

  if (insErr) {
    await supabase.storage.from(BUCKET).remove([imagePath]);
    if (
      insErr.code === "PGRST205" ||
      insErr.code === "PGRST204" ||
      (insErr.message ?? "").toLowerCase().includes("schema cache")
    ) {
      return {
        ok: false,
        error:
          "Supabase no encuentra la tabla cafe_posts en este proyecto. En el SQL Editor ejecuta supabase/migrations/20260411100000_cafe_de_conexion.sql, luego select pg_notify('pgrst', 'reload schema'); y recarga la página.",
      };
    }
    return { ok: false, error: insErr.message };
  }

  await recordCafe();
  revalidatePath("/cafe");
  revalidatePath("/");
  return { ok: true };
}

export async function updateCafePost(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Inicia sesión para editar." };
  }

  const postIdRaw = formData.get("postId");
  const postId = typeof postIdRaw === "string" ? postIdRaw.trim() : "";
  if (!postId) {
    return { ok: false, error: "Publicación no válida." };
  }

  const { data: row, error: fetchErr } = await supabase
    .from("cafe_posts")
    .select("user_id, image_path")
    .eq("id", postId)
    .maybeSingle();

  if (fetchErr || !row || row.user_id !== user.id) {
    return { ok: false, error: "No puedes editar esta publicación." };
  }

  const caption = parseCaption(formData);
  const author = await authorRowForUser(
    supabase,
    user.id,
    user.email ?? undefined,
  );

  let imagePath = row.image_path;
  const imageRaw = formData.get("image");
  let uploadedPath: string | null = null;

  if (imageRaw instanceof File && imageRaw.size > 0) {
    const check = validateImageFile(imageRaw);
    if (!check.ok) return { ok: false, error: check.error };
    const file = check.file;
    const mime = file.type.toLowerCase();
    const ext = extForMime(mime);
    const newPath = `${user.id}/${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(newPath, bytes, {
        contentType: mime,
        upsert: false,
      });
    if (upErr) {
      return { ok: false, error: upErr.message };
    }
    uploadedPath = newPath;
    imagePath = newPath;
  }

  const { error: updErr } = await supabase
    .from("cafe_posts")
    .update({
      caption,
      image_path: imagePath,
      author_label: author.label,
      author_avatar_path: author.avatarPath,
    })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (updErr) {
    if (uploadedPath) {
      await supabase.storage.from(BUCKET).remove([uploadedPath]);
    }
    return { ok: false, error: updErr.message };
  }

  if (uploadedPath && uploadedPath !== row.image_path) {
    await supabase.storage.from(BUCKET).remove([row.image_path]);
  }

  revalidatePath("/cafe");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCafePost(postId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Inicia sesión para eliminar." };
  }

  const id = postId.trim();
  if (!id) {
    return { ok: false, error: "Publicación no válida." };
  }

  const { data: row, error: fetchErr } = await supabase
    .from("cafe_posts")
    .select("user_id, image_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !row || row.user_id !== user.id) {
    return { ok: false, error: "No puedes eliminar esta publicación." };
  }

  const { error: delErr } = await supabase
    .from("cafe_posts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (delErr) {
    return { ok: false, error: delErr.message };
  }

  await supabase.storage.from(BUCKET).remove([row.image_path]);

  revalidatePath("/cafe");
  revalidatePath("/");
  return { ok: true };
}
