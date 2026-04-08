"use client";

import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  removeProfileAvatar,
  updateProfileAvatar,
} from "@/lib/conecta/profile-avatar-actions";
import { UserAvatar } from "./user-avatar";

type ActionResult = { ok: boolean; error?: string } | null;

async function submitAvatar(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return updateProfileAvatar(formData);
}

export function ProfileAvatarSection({
  avatarUrl,
  displayLabel,
}: {
  avatarUrl: string | null;
  displayLabel: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(submitAvatar, null);
  const [removePending, startRemove] = useTransition();
  const [removeError, setRemoveError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <section
      className="rounded-2xl border border-zinc-700/80 bg-zinc-900/50 p-4 shadow-lg ring-1 ring-zinc-600/40"
      aria-labelledby="perfil-foto"
    >
      <h2
        id="perfil-foto"
        className="text-sm font-bold uppercase tracking-wide text-zinc-200"
      >
        Tu foto de perfil
      </h2>
      <p className="mt-1 text-xs text-zinc-400">
        Se muestra en el inicio, café y muro. JPG, PNG, WebP o GIF; máx. 2 MB.
      </p>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <UserAvatar avatarUrl={avatarUrl} label={displayLabel} size="lg" />
        <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
          <form
            ref={formRef}
            action={formAction}
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
          >
            <div className="min-w-0 flex-1">
              <label
                htmlFor="avatar-file"
                className="sr-only"
              >
                Elegir foto
              </label>
              <input
                id="avatar-file"
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-zinc-400 file:to-zinc-300 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-950 hover:file:from-zinc-300 hover:file:to-zinc-200"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 px-4 py-2 text-sm font-bold text-zinc-950 shadow-md disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar foto"}
            </button>
          </form>
          {avatarUrl ? (
            <button
              type="button"
              disabled={removePending}
              onClick={() => {
                setRemoveError(null);
                startRemove(async () => {
                  const r = await removeProfileAvatar();
                  if (r.ok) {
                    router.refresh();
                  } else {
                    setRemoveError(r.error ?? "No se pudo quitar la foto.");
                  }
                });
              }}
              className="self-start text-xs font-semibold text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline disabled:opacity-50"
            >
              {removePending ? "Quitando…" : "Quitar foto"}
            </button>
          ) : null}
          {removeError ? (
            <p className="text-sm text-red-400" role="alert">
              {removeError}
            </p>
          ) : null}
          {state && !state.ok && state.error ? (
            <p className="text-sm text-red-400" role="alert">
              {state.error}
            </p>
          ) : null}
          {state?.ok ? (
            <p className="text-sm text-zinc-300" role="status">
              Foto actualizada.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
