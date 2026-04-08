import type { SupabaseClient } from "@supabase/supabase-js";
import { avatarPublicUrl } from "@/lib/conecta/avatar-public-url";

export type CafeCommentPublic = {
  id: string;
  userId: string;
  authorLabel: string;
  authorAvatarUrl: string | null;
  body: string;
  createdAt: string;
};

export type CafePostPublic = {
  id: string;
  userId: string;
  authorLabel: string;
  authorAvatarUrl: string | null;
  caption: string | null;
  imageUrl: string;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  comments: CafeCommentPublic[];
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

type PostRow = {
  id: string;
  user_id: string;
  author_label: string;
  author_avatar_path: string | null;
  caption: string | null;
  image_path: string;
  created_at: string;
};

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

  const rows = data as PostRow[];
  const postIds = rows.map((r) => r.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const likeCountByPost = new Map<string, number>();
  const likedByMeSet = new Set<string>();
  const commentsByPost = new Map<string, CafeCommentPublic[]>();

  for (const id of postIds) {
    commentsByPost.set(id, []);
  }

  const [likesRes, commentsRes] = await Promise.all([
    supabase
      .from("cafe_post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds),
    supabase
      .from("cafe_post_comments")
      .select(
        "id, post_id, user_id, author_label, author_avatar_path, body, created_at",
      )
      .in("post_id", postIds)
      .order("created_at", { ascending: true }),
  ]);

  if (!likesRes.error && likesRes.data) {
    for (const row of likesRes.data) {
      const pid = row.post_id as string;
      likeCountByPost.set(pid, (likeCountByPost.get(pid) ?? 0) + 1);
      if (user?.id && row.user_id === user.id) {
        likedByMeSet.add(pid);
      }
    }
  }

  if (!commentsRes.error && commentsRes.data) {
    for (const c of commentsRes.data) {
      const list = commentsByPost.get(c.post_id as string);
      if (!list) continue;
      list.push({
        id: c.id as string,
        userId: c.user_id as string,
        authorLabel: c.author_label as string,
        authorAvatarUrl: avatarPublicUrl(
          supabase,
          c.author_avatar_path as string | null,
        ),
        body: c.body as string,
        createdAt: c.created_at as string,
      });
    }
  }

  const posts: CafePostPublic[] = rows.map((row) => {
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
      likeCount: likeCountByPost.get(row.id) ?? 0,
      likedByMe: likedByMeSet.has(row.id),
      comments: commentsByPost.get(row.id) ?? [],
    };
  });

  return { posts, loadError: null };
}
