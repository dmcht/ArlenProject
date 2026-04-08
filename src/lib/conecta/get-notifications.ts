import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationKind = "cafe_new_post" | "cafe_like" | "cafe_comment";

export type NotificationPublic = {
  id: string;
  kind: NotificationKind;
  title: string;
  readAt: string | null;
  createdAt: string;
  cafePostId: string | null;
};

export async function getNotificationsForUser(
  supabase: SupabaseClient,
  userId: string,
  limit = 40,
): Promise<{ items: NotificationPublic[]; unreadCount: number }> {
  const [listRes, countRes] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, kind, title, read_at, created_at, cafe_post_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
  ]);

  if (listRes.error || !listRes.data) {
    return { items: [], unreadCount: 0 };
  }

  const data = listRes.data;
  const unreadExact = countRes.error ? null : countRes.count;

  const items: NotificationPublic[] = data.map((row) => ({
    id: row.id as string,
    kind: row.kind as NotificationKind,
    title: row.title as string,
    readAt: (row.read_at as string | null) ?? null,
    createdAt: row.created_at as string,
    cafePostId: (row.cafe_post_id as string | null) ?? null,
  }));

  const unreadCount =
    typeof unreadExact === "number"
      ? unreadExact
      : items.filter((n) => n.readAt == null).length;

  return { items, unreadCount };
}
