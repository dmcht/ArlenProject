"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  PROFILE_AVATAR_BUCKET,
  PROFILE_AVATAR_MAX_BYTES,
  PROFILE_AVATAR_MIMES,
} from "@/lib/conecta/profile-avatar-bucket";

function extForMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function updateProfileAvatar(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Inicia sesión para cambiar tu foto." };
  }

  const raw = formData.get("avatar");
  if (!(raw instanceof File) || raw.size === 0) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (raw.size > PROFILE_AVATAR_MAX_BYTES) {
    return { ok: false, error: "La foto debe pesar menos de 2 MB." };
  }
  const mime = raw.type.toLowerCase();
  if (!PROFILE_AVATAR_MIMES.has(mime)) {
    return { ok: false, error: "Formato permitido: JPG, PNG, WebP o GIF." };
  }

  const { data: prev, error: prevErr } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  if (prevErr) {
    return { ok: false, error: "No pudimos leer tu perfil." };
  }

  const ext = extForMime(mime);
  const path = `${user.id}/${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await raw.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(path, bytes, {
      contentType: mime,
      upsert: false,
    });

  if (upErr) {
    return { ok: false, error: upErr.message };
  }

  const { error: updErr } = await supabase
    .from("profiles")
    .update({ avatar_path: path, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updErr) {
    await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([path]);
    if (
      updErr.code === "PGRST204" ||
      (updErr.message ?? "").toLowerCase().includes("column")
    ) {
      return {
        ok: false,
        error:
          "Falta la columna avatar_path o el bucket. Ejecuta supabase/migrations/20260415130000_profile_avatars.sql en Supabase.",
      };
    }
    return { ok: false, error: updErr.message };
  }

  const oldPath = prev?.avatar_path?.trim();
  if (oldPath && oldPath !== path) {
    await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([oldPath]);
  }

  revalidatePath("/");
  revalidatePath("/cafe");
  revalidatePath("/muro");
  return { ok: true };
}

export async function removeProfileAvatar(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Inicia sesión." };
  }

  const { data: prev, error: prevErr } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  if (prevErr) {
    return { ok: false, error: "No pudimos leer tu perfil." };
  }

  const oldPath = prev?.avatar_path?.trim();
  if (!oldPath) {
    return { ok: true };
  }

  const { error: updErr } = await supabase
    .from("profiles")
    .update({ avatar_path: null, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updErr) {
    return { ok: false, error: updErr.message };
  }

  await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([oldPath]);

  revalidatePath("/");
  revalidatePath("/cafe");
  revalidatePath("/muro");
  return { ok: true };
}
