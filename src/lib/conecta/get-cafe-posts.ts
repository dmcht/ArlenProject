import type { SupabaseClient } from "@supabase/supabase-js";
import { avatarPublicUrl } from "@/lib/conecta/avatar-public-url";

export type CafePostPublic = {
  id: string;
  userId: string;
  authorLabel: string;
  authorAvatarUrl: string | null;
  caption: string | null;
  imageUrl: string;
  createdAt: string;
};

export type CafePostsLoadError = {
  code: string | null;
  message: string;
  /** PGRST205 u otro fallo de caché / tabla no expuesta */
  isSchemaOrMissingTable: boolean;
};

export type CafePostsLoadResult = {
  posts: CafePostPublic[];
  loadError: CafePostsLoadError | null;
};

const BUCKET = "cafe-posts";

function classifyLoadError(message: string, code: string | null): boolean {
  if (code === "PGRST205" || code === "PGRST204") return true;
  const m = message.toLowerCase();
  return (
    m.includes("schema cache") ||
    m.includes("could not find the table") ||
    m.includes("could not find the column")
  );
}

/** Usa el mismo `createClient()` del request (no abrir otro cliente). */
export async function getCafePosts(
  supabase: SupabaseClient,
): Promise<CafePostsLoadResult> {
  const { data, error } = await supabase
    .from("cafe_posts")
    .select(
      "id, user_id, author_label, author_avatar_path, caption, image_path, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getCafePosts]", error.message, error.code, error.details);
    return {
      posts: [],
      loadError: {
        code: error.code ?? null,
        message: error.message,
        isSchemaOrMissingTable: classifyLoadError(
          error.message,
          error.code ?? null,
        ),
      },
    };
  }

  if (!data?.length) {
    return { posts: [], loadError: null };
  }

  const posts = data.map((row) => {
    const { data: pub } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(row.image_path);
    return {
      id: row.id,
      userId: row.user_id,
      authorLabel: row.author_label,
      authorAvatarUrl: avatarPublicUrl(supabase, row.author_avatar_path),
      caption: row.caption,
      imageUrl: pub.publicUrl,
      createdAt: row.created_at,
    };
  });

  return { posts, loadError: null };
}
