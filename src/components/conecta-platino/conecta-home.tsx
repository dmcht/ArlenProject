import type { UserProgressPayload } from "@/lib/conecta/get-progress";
import { ActionGrid } from "./action-grid";
import { HillsFooter } from "./hills-footer";
import { ProgressSection } from "./progress-section";
import { SkyHeader } from "./sky-header";

export function ConectaHome({ progress }: { progress: UserProgressPayload }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-950 via-neutral-950 to-black">
      <SkyHeader
        userEmail={progress.userEmail}
        avatarUrl={progress.isAuthenticated ? progress.avatarUrl : null}
        displayName={progress.displayName}
      />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-5 sm:px-5">
        <ActionGrid />
        <ProgressSection data={progress} />
      </main>
      <HillsFooter />
    </div>
  );
}
