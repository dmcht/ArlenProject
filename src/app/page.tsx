import { ConectaHome } from "@/components/conecta-platino/conecta-home";
import {
  getNotificationsForUser,
  type NotificationPublic,
} from "@/lib/conecta/get-notifications";
import { getUserProgress } from "@/lib/conecta/get-progress";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const progress = await getUserProgress();

  let notifications: {
    items: NotificationPublic[];
    unreadCount: number;
  } = { items: [], unreadCount: 0 };

  if (progress.isAuthenticated) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        notifications = await getNotificationsForUser(supabase, user.id);
      }
    } catch {
      /* sin Supabase en .env */
    }
  }

  return (
    <ConectaHome progress={progress} notifications={notifications} />
  );
}
