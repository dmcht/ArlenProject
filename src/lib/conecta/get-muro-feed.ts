import type { SupabaseClient } from "@supabase/supabase-js";

export type MuroCommentPublic = {
  id: string;
  userId: string;
  authorLabel: string;
  body: string;
  createdAt: string;
};

export type MuroPostPublic = {
  id: string;
  userId: string;
  authorLabel: string;
  body: string;
  createdAt: string;
  comments: MuroCommentPublic[];
};

export type MuroFeedLoadError = {
  code: string | null;
  message: string;
  isSchemaOrMissingTable: boolean;
};

export type MuroFeedResult = {
  posts: MuroPostPublic[];
  loadError: MuroFeedLoadError | null;
};

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
  body: string;
  created_at: string;
};

type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  author_label: string;
  body: string;
  created_at: string;
};

export async function getMuroFeed(
  supabase: SupabaseClient,
): Promise<MuroFeedResult> {
  const { data: postRows, error: postsErr } = await supabase
    .from("muro_posts")
    .select("id, user_id, author_label, body, created_at")
    .order("created_at", { ascending: false })
    .limit(40);

  if (postsErr) {
    console.error("[getMuroFeed] posts", postsErr.message, postsErr.code);
    return {
      posts: [],
      loadError: {
        code: postsErr.code ?? null,
        message: postsErr.message,
        isSchemaOrMissingTable: classifyLoadError(
          postsErr.message,
          postsErr.code ?? null,
        ),
      },
    };
  }

  const posts = (postRows ?? []) as PostRow[];
  if (posts.length === 0) {
    return { posts: [], loadError: null };
  }

  const postIds = posts.map((p) => p.id);
  const { data: commentRows, error: commentsErr } = await supabase
    .from("muro_comments")
    .select("id, post_id, user_id, author_label, body, created_at")
    .in("post_id", postIds)
    .order("created_at", { ascending: true });

  if (commentsErr) {
    console.error("[getMuroFeed] comments", commentsErr.message, commentsErr.code);
    return {
      posts: [],
      loadError: {
        code: commentsErr.code ?? null,
        message: commentsErr.message,
        isSchemaOrMissingTable: classifyLoadError(
          commentsErr.message,
          commentsErr.code ?? null,
        ),
      },
    };
  }

  const byPost = new Map<string, MuroCommentPublic[]>();
  for (const id of postIds) byPost.set(id, []);

  for (const c of (commentRows ?? []) as CommentRow[]) {
    const list = byPost.get(c.post_id);
    if (!list) continue;
    list.push({
      id: c.id,
      userId: c.user_id,
      authorLabel: c.author_label,
      body: c.body,
      createdAt: c.created_at,
    });
  }

  const mapped: MuroPostPublic[] = posts.map((p) => ({
    id: p.id,
    userId: p.user_id,
    authorLabel: p.author_label,
    body: p.body,
    createdAt: p.created_at,
    comments: byPost.get(p.id) ?? [],
  }));

  return { posts: mapped, loadError: null };
}
