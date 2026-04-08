"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { UserAvatar } from "@/components/conecta-platino/user-avatar";
import {
  createMuroComment,
  createMuroPost,
} from "@/lib/conecta/muro-actions";
import type {
  MuroFeedLoadError,
  MuroPostPublic,
} from "@/lib/conecta/get-muro-feed";

type PostActionResult = { ok: boolean; error?: string } | null;

async function submitMuroPost(
  _prev: PostActionResult,
  formData: FormData,
): Promise<PostActionResult> {
  const body = String(formData.get("body") ?? "");
  return createMuroPost(body);
}

function MuroSetupHelp({ loadError }: { loadError: MuroFeedLoadError }) {
  const schemaIssue = loadError.isSchemaOrMissingTable;
  return (
    <div
      className="rounded-2xl border border-zinc-600/80 bg-zinc-800/50 px-4 py-4 text-sm text-zinc-100 ring-1 ring-zinc-700/60"
      role="alert"
    >
      <p className="font-bold">
        {schemaIssue
          ? "Falta configurar el muro en Supabase"
          : "No se pudo cargar el muro"}
      </p>
      {loadError.code ? (
        <p className="mt-1 font-mono text-xs text-zinc-400">
          {loadError.code}: {loadError.message}
        </p>
      ) : null}
      {schemaIssue ? (
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-zinc-300">
          En el <strong>SQL Editor</strong> ejecuta el archivo{" "}
          <code className="rounded bg-zinc-900/80 px-1 text-zinc-200">
            supabase/migrations/20260412100000_muro_compartir.sql
          </code>{" "}
          y luego{" "}
          <code className="rounded bg-zinc-900/80 px-1 text-zinc-200">
            {`select pg_notify('pgrst', 'reload schema');`}
          </code>
        </p>
      ) : null}
    </div>
  );
}

function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-2 flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const text = String(fd.get("body") ?? "").trim();
        setError(null);
        startTransition(async () => {
          const res = await createMuroComment(postId, text);
          if (res.ok) {
            form.reset();
            router.refresh();
          } else {
            setError(res.error ?? "No se pudo comentar");
          }
        });
      }}
    >
      <label className="sr-only" htmlFor={`comment-${postId}`}>
        Tu comentario
      </label>
      <textarea
        id={`comment-${postId}`}
        name="body"
        rows={2}
        maxLength={1500}
        required
        placeholder="Escribe un comentario…"
        className="w-full resize-y rounded-xl border border-zinc-600 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-500/30 placeholder:text-zinc-500 focus:border-zinc-400 focus:ring-2"
      />
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-gradient-to-r from-zinc-400 to-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:from-zinc-300 hover:to-zinc-200 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Comentar"}
      </button>
    </form>
  );
}

function PostCard({
  post,
  canInteract,
}: {
  post: MuroPostPublic;
  canInteract: boolean;
}) {
  const when = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/50 shadow-lg shadow-black/30 ring-1 ring-zinc-600/40">
      <div className="flex items-start gap-3 border-b border-zinc-700/60 bg-gradient-to-r from-zinc-800/90 to-zinc-900/80 px-4 py-3">
        <UserAvatar
          avatarUrl={post.authorAvatarUrl}
          label={post.authorLabel}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-50">
            {post.authorLabel}
          </p>
          <p className="text-xs text-zinc-500">{when}</p>
        </div>
      </div>
      <div className="px-4 py-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
          {post.body}
        </p>
      </div>
      <div className="border-t border-zinc-700/60 bg-zinc-950/30 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Comentarios ({post.comments.length})
        </p>
        <ul className="mt-2 space-y-3">
          {post.comments.map((c) => {
            const cw = formatDistanceToNow(new Date(c.createdAt), {
              addSuffix: true,
              locale: es,
            });
            return (
              <li
                key={c.id}
                className="rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <UserAvatar
                    avatarUrl={c.authorAvatarUrl}
                    label={c.authorLabel}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-100">
                      {c.authorLabel}
                    </p>
                    <p className="text-xs text-zinc-500">{cw}</p>
                  </div>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-zinc-300">
                  {c.body}
                </p>
              </li>
            );
          })}
        </ul>
        {canInteract ? <CommentForm postId={post.id} /> : null}
      </div>
    </article>
  );
}

export function MuroClient({
  posts,
  loadError,
  isAuthenticated,
}: {
  posts: MuroPostPublic[];
  loadError: MuroFeedLoadError | null;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(submitMuroPost, null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="space-y-10">
      {loadError ? <MuroSetupHelp loadError={loadError} /> : null}

      {isAuthenticated ? (
        <section
          className="rounded-2xl border border-zinc-700/80 bg-zinc-900/50 p-5 shadow-lg ring-1 ring-zinc-600/40"
          aria-labelledby="muro-nuevo"
        >
          <h2
            id="muro-nuevo"
            className="text-sm font-bold uppercase tracking-wide text-zinc-200"
          >
            Comparte una reflexión
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Pensamientos, aprendizajes o algo que quieras que el equipo lea. Los
            demás pueden comentar abajo de cada publicación.
          </p>
          <form ref={formRef} action={formAction} className="mt-4 space-y-3">
            <textarea
              name="body"
              rows={5}
              maxLength={4000}
              required
              placeholder="¿Qué quieres compartir hoy?"
              className="w-full resize-y rounded-xl border border-zinc-600 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-500/30 placeholder:text-zinc-500 focus:border-zinc-400 focus:ring-2"
            />
            {state && !state.ok && state.error ? (
              <p className="text-sm text-red-400" role="alert">
                {state.error}
              </p>
            ) : null}
            {state?.ok ? (
              <p className="text-sm font-medium text-zinc-300" role="status">
                Publicado. Ya aparece en el muro.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 px-5 py-2.5 text-sm font-bold text-zinc-950 shadow-md shadow-black/30 hover:from-zinc-200 hover:via-white hover:to-zinc-300 disabled:opacity-60"
            >
              {pending ? "Publicando…" : "Publicar reflexión"}
            </button>
          </form>
        </section>
      ) : (
        <p className="rounded-2xl border border-zinc-700/60 bg-zinc-800/40 px-4 py-3 text-sm text-zinc-200">
          <Link
            href="/login"
            className="font-semibold text-white underline-offset-2 hover:underline"
          >
            Inicia sesión
          </Link>{" "}
          para publicar reflexiones y comentar.
        </p>
      )}

      <section aria-labelledby="muro-feed">
        <h2 id="muro-feed" className="text-lg font-bold text-zinc-50">
          Muro
        </h2>
        {!isAuthenticated ? (
          <p className="mt-2 text-sm text-zinc-400">
            El muro solo se muestra a usuarios registrados.
          </p>
        ) : loadError ? (
          <p className="mt-3 text-sm text-zinc-400">
            Cuando la base esté lista verás aquí las publicaciones.
          </p>
        ) : posts.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">
            Aún no hay reflexiones. Anima al equipo a compartir la primera.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-6">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} canInteract={isAuthenticated} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
