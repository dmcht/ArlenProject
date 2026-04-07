import { createAdminClient } from "@/lib/supabase/admin";

export async function loadAdminUserEmailMap(
  admin: ReturnType<typeof createAdminClient>,
): Promise<
  Map<string, string>
> {
  const map = new Map<string, string>();
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      break;
    }
    const users = data?.users ?? [];
    for (const u of users) {
      map.set(u.id, u.email ?? "");
    }
    if (users.length < perPage) break;
    page += 1;
  }
  return map;
}
