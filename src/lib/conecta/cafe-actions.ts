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

  const captionRaw = formData.get("caption");
  const caption =
    typeof captionRaw === "string"
      ? captionRaw.trim().slice(0, 500) || null
      : null;

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("display_name")
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
