"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function revalidateHome() {
  revalidatePath("/");
}

/** Suma 1 a charlas_realizadas del usuario autenticado (RPC en Supabase). */
export async function recordCharla() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_charlas");
  if (!error) await revalidateHome();
  return { ok: !error, error: error?.message };
}

export async function recordCafe() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_cafes");
  if (!error) await revalidateHome();
  return { ok: !error, error: error?.message };
}

export async function recordReconocimiento() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_reconocimientos");
  if (!error) await revalidateHome();
  return { ok: !error, error: error?.message };
}
