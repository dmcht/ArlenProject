"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  createCafePost,
  deleteCafePost,
  updateCafePost,
} from "@/lib/conecta/cafe-actions";
import {
  addCafePostComment,
  deleteCafePostComment,
  toggleCafePostLike,
} from "@/lib/conecta/cafe-social-actions";
import { UserAvatar } from "@/components/conecta-platino/user-avatar";
import type {
  CafePostPublic,
  CafePostsLoadError,
} from "@/lib/conecta/get-cafe-posts";

type ActionResult = { ok: boolean; error?: string } | null;

async function submitCafePost(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return createCafePost(formData);
}

async function submitCafeUpdate(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return updateCafePost(formData);
}

function CafePostSocialBar({
  post,
  currentUserId,
}: {
  post: CafePostPublic;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [likePending, startLike] = useTransition();
  const [commentPending, startComment] = useTransition();
  const [delCommentPending, startDelComment] = useTransition();
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(true);

  const nComments = post.comments.length;

  function handleToggleLike() {
    if (!currentUserId) return;
    startLike(async () => {
      await toggleCafePostLike(post.id);
      router.refresh();
    });
  }

  function handleCommentSubmit(e: FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || !currentUserId) return;
    setCommentError(null);
    startComment(async () => {
      const r = await addCafePostComment(post.id, text);
      if (r.ok) {
        setCommentText("");
        router.refresh();
      } else {
        setCommentError(r.error ?? "No se pudo comentar.");
      }
    });
  }

  function handleDeleteComment(commentId: string) {
    if (!confirm("¿Eliminar este comentario?")) return;
    startDelComment(async () => {
      await deleteCafePostComment(commentId);
      router.refresh();
    });
  }

  return (
    <div className="border-t border-zinc-700/60 bg-zinc-950/25">
      {(post.likeCount > 0 || nComments > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs text-zinc-500">
          <span>
            {post.likeCount > 0 ? (
              <span className="font-medium text-zinc-400">
                {post.likeCount === 1
                  ? "1 me gusta"
                  : `${post.likeCount} me gusta`}
              </span>
            ) : (
              <span />
            )}
          </span>
          {nComments > 0 ? (
            <button
              type="button"
              onClick={() => setShowComments((v) => !v)}
              className="font-medium text-zinc-400 hover:text-zinc-300"
            >
              {nComments === 1 ? "1 comentario" : `${nComments} comentarios`}
            </button>
          ) : null}
        </div>
      )}

      <div className="flex border-t border-zinc-700/50">
        <button
          type="button"
          disabled={!currentUserId || likePending}
          onClick={handleToggleLike}
          className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            post.likedByMe
              ? "text-red-400 hover:bg-zinc-800/60"
              : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
          }`}
        >
          <Heart
            className="h-5 w-5 shrink-0"
            strokeWidth={2}
            fill={post.likedByMe ? "currentColor" : "none"}
          />
          Me gusta
        </button>
        <button
          type="button"
          onClick={() => {
            setShowComments(true);
            commentRef.current?.focus();
          }}
          className="flex flex-1 items-center justify-center gap-2 border-l border-zinc-700/50 py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800/60 hover:text-zinc-200"
        >
          <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2} />
          Comentar
        </button>
      </div>

      {showComments && nComments > 0 ? (
        <ul className="space-y-2 border-t border-zinc-700/50 px-4 py-3">
          {post.comments.map((c) => {
            const cw = formatDistanceToNow(new Date(c.createdAt), {
              addSuffix: true,
              locale: es,
            });
            const isMine = currentUserId != null && c.userId === currentUserId;
            return (
              <li
                key={c.id}
                className="flex gap-2 rounded-lg bg-zinc-900/70 px-2 py-2 text-sm"
              >
                <UserAvatar
                  avatarUrl={c.authorAvatarUrl}
                  label={c.authorLabel}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                    <span className="font-semibold text-zinc-100">
                      {c.authorLabel}
                    </span>
                    <span className="text-[0.65rem] text-zinc-500">{cw}</span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-zinc-300">
                    {c.body}
                  </p>
                  {isMine ? (
                    <button
                      type="button"
                      disabled={delCommentPending}
                      onClick={() => handleDeleteComment(c.id)}
                      className="mt-1 text-[0.65rem] font-medium text-zinc-500 hover:text-red-400 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {currentUserId ? (
        <form
          onSubmit={handleCommentSubmit}
          className="border-t border-zinc-700/50 px-4 py-3"
        >
          <label className="sr-only" htmlFor={`cafe-comment-${post.id}`}>
            Escribe un comentario
          </label>
          <textarea
            ref={commentRef}
            id={`cafe-comment-${post.id}`}
            rows={2}
            maxLength={1500}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe un comentario…"
            className="w-full resize-y rounded-xl border border-zinc-600 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-500/30 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2"
          />
          {commentError ? (
            <p className="mt-1 text-xs text-red-400" role="alert">
              {commentError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={commentPending || !commentText.trim()}
            className="mt-2 rounded-lg bg-gradient-to-r from-zinc-500 to-zinc-400 px-4 py-1.5 text-xs font-bold text-zinc-950 hover:from-zinc-400 hover:to-zinc-300 disabled:opacity-50"
          >
            {commentPending ? "Enviando…" : "Publicar comentario"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function CafePostRow({
  post,
  currentUserId,
}: {
  post: CafePostPublic;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const isOwner = currentUserId != null && post.userId === currentUserId;
  const [editing, setEditing] = useState(false);
  const [editSession, setEditSession] = useState(0);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, startDelete] = useTransition();
  const [updState, updAction, updPending] = useActionState(
    submitCafeUpdate,
    null,
  );

  useEffect(() => {
    if (updState?.ok) {
      setEditing(false);
      router.refresh();
    }
  }, [updState, router]);

  const when = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  });

  function handleDelete() {
    if (!confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) {
      return;
    }
    setDeleteError(null);
    startDelete(async () => {
      const r = await deleteCafePost(post.id);
      if (r.ok) {
        router.refresh();
      } else {
        setDeleteError(r.error ?? "No se pudo eliminar.");
      }
    });
  }

  return (
    <article
      id={`cafe-post-${post.id}`}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/50 shadow-lg shadow-black/30 ring-1 ring-zinc-600/40"
    >
      <div className="flex items-center gap-3 border-b border-zinc-700/60 bg-gradient-to-r from-zinc-800/90 to-zinc-900/80 px-4 py-3">
        <UserAvatar
          avatarUrl={post.authorAvatarUrl}
          label={post.authorLabel}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-50">
            {post.authorLabel}
          </p>
          <p className="text-xs text-zinc-500">{when}</p>
        </div>
        {isOwner ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {!editing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setEditSession((n) => n + 1);
                    setEditing(true);
                  }}
                  className="rounded-lg border border-zinc-600/90 bg-zinc-900/80 px-2.5 py-1 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={pendingDelete}
                  className="rounded-lg border border-red-900/60 bg-red-950/40 px-2.5 py-1 text-xs font-semibold text-red-200 hover:bg-red-950/70 disabled:opacity-50"
                >
                  {pendingDelete ? "Eliminando…" : "Eliminar"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDeleteError(null);
                }}
                className="rounded-lg border border-zinc-600/90 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Cerrar
              </button>
            )}
          </div>
        ) : null}
      </div>

      {editing && isOwner ? (
        <form
          key={`${post.id}-${editSession}`}
          action={updAction}
          className="space-y-4 border-b border-zinc-700/60 p-4"
        >
          <input type="hidden" name="postId" value={post.id} />
          <div>
            <label
              htmlFor={`cafe-edit-caption-${post.id}`}
              className="block text-xs font-semibold text-zinc-300"
            >
              Mensaje
            </label>
            <textarea
              id={`cafe-edit-caption-${post.id}`}
              name="caption"
              rows={3}
              maxLength={500}
              defaultValue={post.caption ?? ""}
              placeholder="Texto de la publicación (opcional)"
              className="mt-1.5 w-full rounded-xl border border-zinc-600 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-500/30 placeholder:text-zinc-500 focus:border-zinc-400 focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor={`cafe-edit-image-${post.id}`}
              className="block text-xs font-semibold text-zinc-300"
            >
              Cambiar imagen (opcional)
            </label>
            <input
              id={`cafe-edit-image-${post.id}`}
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1.5 block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-100 hover:file:bg-zinc-500"
            />
            <p className="mt-1 text-[0.65rem] text-zinc-500">
              Si no eliges archivo, se mantiene la foto actual.
            </p>
          </div>
          {updState && !updState.ok && updState.error ? (
            <p className="text-sm text-red-400" role="alert">
              {updState.error}
            </p>
          ) : null}
          {updState?.ok ? (
            <p className="text-sm font-medium text-zinc-300" role="status">
              Cambios guardados.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={updPending}
            className="rounded-xl bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 px-4 py-2 text-sm font-bold text-zinc-950 shadow-md disabled:opacity-60"
          >
            {updPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      ) : null}

      <div className="relative aspect-[4/3] w-full bg-zinc-950 sm:aspect-video">
        <Image
          src={post.imageUrl}
          alt={post.caption || "Publicación del café de conexión"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 32rem"
          unoptimized={false}
        />
      </div>
      {!editing && post.caption ? (
        <p className="px-4 py-3 text-sm leading-relaxed text-zinc-300">
          {post.caption}
        </p>
      ) : null}
      {!editing ? (
        <CafePostSocialBar post={post} currentUserId={currentUserId} />
      ) : null}
      {deleteError ? (
        <p className="border-t border-zinc-700/60 px-4 py-2 text-sm text-red-400">
          {deleteError}
        </p>
      ) : null}
    </article>
  );
}

function CafeSetupHelp({ loadError }: { loadError: CafePostsLoadError }) {
  const schemaIssue = loadError.isSchemaOrMissingTable;
  return (
    <div
      className="rounded-2xl border border-zinc-600/80 bg-zinc-800/50 px-4 py-4 text-sm text-zinc-100 ring-1 ring-zinc-700/60"
      role="alert"
    >
      <p className="font-bold">
        {schemaIssue
          ? "Falta la tabla en Supabase o la API no la ve todavía"
          : "No se pudo cargar el muro"}
      </p>
      {loadError.code ? (
        <p className="mt-1 font-mono text-xs text-zinc-400">
          {loadError.code}: {loadError.message}
        </p>
      ) : (
        <p className="mt-1 text-xs text-zinc-400">{loadError.message}</p>
      )}
      {schemaIssue ? (
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[0.8125rem] leading-relaxed text-zinc-300">
          <li>
            Abre el{" "}
            <strong>mismo proyecto</strong> de Supabase que usa tu{" "}
            <code className="rounded bg-zinc-900/80 px-1 text-zinc-200">.env</code> (
            <code className="rounded bg-zinc-900/80 px-1 text-zinc-200">
              NEXT_PUBLIC_SUPABASE_URL
            </code>
            ).
          </li>
          <li>
            Ve a <strong>SQL</strong> → New query → pega y ejecuta{" "}
            <strong>todo</strong> el archivo{" "}
            <code className="rounded bg-zinc-900/80 px-1 text-zinc-200">
              supabase/migrations/20260411100000_cafe_de_conexion.sql
            </code>
            .
          </li>
          <li>
            En <strong>Table Editor</strong> comprueba que exista la tabla{" "}
            <code className="rounded bg-zinc-900/80 px-1 text-zinc-200">cafe_posts</code>.
          </li>
          <li>
            Para <strong>me gusta y comentarios</strong>, ejecuta también{" "}
            <code className="rounded bg-zinc-900/80 px-1 text-zinc-200">
              supabase/migrations/20260417120000_cafe_likes_comments.sql
            </code>
            .
          </li>
          <li>
            Para <strong>notificaciones</strong> (publicaciones, me gusta,
            comentarios):{" "}
            <code className="rounded bg-zinc-900/80 px-1 text-zinc-200">
              supabase/migrations/20260418120000_cafe_notifications.sql
            </code>
            .
          </li>
          <li>
            Ejecuta otra vez en SQL:{" "}
            <code className="mt-1 block rounded bg-zinc-900/80 px-2 py-1 text-xs text-zinc-200">
              {`select pg_notify('pgrst', 'reload schema');`}
            </code>
          </li>
          <li>
            Si sigue igual: <strong>Project Settings → Data API</strong> → revisa
            que el esquema <code className="rounded bg-zinc-900/80 px-1 text-zinc-200">public</code>{" "}
            esté expuesto; prueba desactivar y volver a activar la Data API.
          </li>
        </ol>
      ) : null}
    </div>
  );
}

export function CafeClient({
  posts,
  loadError,
  isAuthenticated,
  currentUserId,
}: {
  posts: CafePostPublic[];
  loadError: CafePostsLoadError | null;
  isAuthenticated: boolean;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(submitCafePost, null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  const postIdsKey = posts.map((p) => p.id).join(",");

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.startsWith("cafe-post-")) return;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [postIdsKey]);

  return (
    <div className="space-y-10">
      {loadError ? <CafeSetupHelp loadError={loadError} /> : null}
      {isAuthenticated ? (
        <section
          className="rounded-2xl border border-zinc-700/80 bg-zinc-900/50 p-5 shadow-lg ring-1 ring-zinc-600/40"
          aria-labelledby="cafe-nuevo"
        >
          <h2
            id="cafe-nuevo"
            className="text-sm font-bold uppercase tracking-wide text-zinc-200"
          >
            Nueva publicación
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Sube una foto de tu café de conexión y, si quieres, añade un mensaje
            corto.
          </p>
          <form ref={formRef} action={formAction} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="cafe-image"
                className="block text-xs font-semibold text-zinc-300"
              >
                Imagen
              </label>
              <input
                id="cafe-image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
                className="mt-1.5 block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-zinc-400 file:to-zinc-300 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-950 hover:file:from-zinc-300 hover:file:to-zinc-200"
              />
            </div>
            <div>
              <label
                htmlFor="cafe-caption"
                className="block text-xs font-semibold text-zinc-300"
              >
                Mensaje (opcional)
              </label>
              <textarea
                id="cafe-caption"
                name="caption"
                rows={2}
                maxLength={500}
                placeholder="¿Qué estás compartiendo hoy?"
                className="mt-1.5 w-full rounded-xl border border-zinc-600 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-500/30 placeholder:text-zinc-500 focus:border-zinc-400 focus:ring-2"
              />
            </div>
            {state && !state.ok && state.error ? (
              <p className="text-sm text-red-400" role="alert">
                {state.error}
              </p>
            ) : null}
            {state?.ok ? (
              <p className="text-sm font-medium text-zinc-300" role="status">
                ¡Publicado! Ya aparece abajo.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 px-5 py-2.5 text-sm font-bold text-zinc-950 shadow-md shadow-black/30 hover:from-zinc-200 hover:via-white hover:to-zinc-300 disabled:opacity-60"
            >
              {pending ? "Publicando…" : "Publicar"}
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
          para subir fotos y ver el muro del café.
        </p>
      )}

      <section aria-labelledby="cafe-muro">
        <h2
          id="cafe-muro"
          className="text-lg font-bold text-zinc-50"
        >
          Muro del café
        </h2>
        {!isAuthenticated ? (
          <p className="mt-2 text-sm text-zinc-400">
            El contenido solo está disponible para usuarios registrados.
          </p>
        ) : loadError ? (
          <p className="mt-3 text-sm text-zinc-400">
            Cuando la base esté lista, las publicaciones aparecerán aquí.
          </p>
        ) : posts.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">
            Aún no hay publicaciones. ¡Sé el primero en compartir un momento!
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-6">
            {posts.map((post) => (
              <li key={post.id}>
                <CafePostRow post={post} currentUserId={currentUserId} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
