"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { createCafePost } from "@/lib/conecta/cafe-actions";
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

function PostCard({ post }: { post: CafePostPublic }) {
  const when = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-amber-100/90 bg-white shadow-md shadow-amber-900/5 ring-1 ring-amber-50">
      <div className="flex items-center gap-3 border-b border-amber-100/80 bg-gradient-to-r from-amber-50/90 to-orange-50/50 px-4 py-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-sm"
          aria-hidden
        >
          {post.authorLabel.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-amber-950">
            {post.authorLabel}
          </p>
          <p className="text-xs text-amber-800/70">{when}</p>
        </div>
      </div>
      <div className="relative aspect-[4/3] w-full bg-amber-100/40 sm:aspect-video">
        <Image
          src={post.imageUrl}
          alt={post.caption || "Publicación del café de conexión"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 32rem"
          unoptimized={false}
        />
      </div>
      {post.caption ? (
        <p className="px-4 py-3 text-sm leading-relaxed text-slate-700">
          {post.caption}
        </p>
      ) : null}
    </article>
  );
}

function CafeSetupHelp({ loadError }: { loadError: CafePostsLoadError }) {
  const schemaIssue = loadError.isSchemaOrMissingTable;
  return (
    <div
      className="rounded-2xl border border-amber-300/90 bg-amber-100/50 px-4 py-4 text-sm text-amber-950 ring-1 ring-amber-200/80"
      role="alert"
    >
      <p className="font-bold text-amber-950">
        {schemaIssue
          ? "Falta la tabla en Supabase o la API no la ve todavía"
          : "No se pudo cargar el muro"}
      </p>
      {loadError.code ? (
        <p className="mt-1 font-mono text-xs text-amber-900/80">
          {loadError.code}: {loadError.message}
        </p>
      ) : (
        <p className="mt-1 text-xs text-amber-900/80">{loadError.message}</p>
      )}
      {schemaIssue ? (
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[0.8125rem] leading-relaxed text-amber-950/95">
          <li>
            Abre el{" "}
            <strong>mismo proyecto</strong> de Supabase que usa tu{" "}
            <code className="rounded bg-amber-200/60 px-1">.env</code> (
            <code className="rounded bg-amber-200/60 px-1">
              NEXT_PUBLIC_SUPABASE_URL
            </code>
            ).
          </li>
          <li>
            Ve a <strong>SQL</strong> → New query → pega y ejecuta{" "}
            <strong>todo</strong> el archivo{" "}
            <code className="rounded bg-amber-200/60 px-1">
              supabase/migrations/20260411100000_cafe_de_conexion.sql
            </code>
            .
          </li>
          <li>
            En <strong>Table Editor</strong> comprueba que exista la tabla{" "}
            <code className="rounded bg-amber-200/60 px-1">cafe_posts</code>.
          </li>
          <li>
            Ejecuta otra vez en SQL:{" "}
            <code className="mt-1 block rounded bg-amber-200/60 px-2 py-1 text-xs">
              {`select pg_notify('pgrst', 'reload schema');`}
            </code>
          </li>
          <li>
            Si sigue igual: <strong>Project Settings → Data API</strong> → revisa
            que el esquema <code className="rounded bg-amber-200/60 px-1">public</code>{" "}
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
}: {
  posts: CafePostPublic[];
  loadError: CafePostsLoadError | null;
  isAuthenticated: boolean;
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

  return (
    <div className="space-y-10">
      {loadError ? <CafeSetupHelp loadError={loadError} /> : null}
      {isAuthenticated ? (
        <section
          className="rounded-2xl border border-amber-200/80 bg-white/90 p-5 shadow-sm ring-1 ring-amber-100/80"
          aria-labelledby="cafe-nuevo"
        >
          <h2
            id="cafe-nuevo"
            className="text-sm font-bold uppercase tracking-wide text-amber-800"
          >
            Nueva publicación
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Sube una foto de tu café de conexión y, si quieres, añade un mensaje
            corto.
          </p>
          <form ref={formRef} action={formAction} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="cafe-image"
                className="block text-xs font-semibold text-amber-900"
              >
                Imagen
              </label>
              <input
                id="cafe-image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
                className="mt-1.5 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-amber-600"
              />
            </div>
            <div>
              <label
                htmlFor="cafe-caption"
                className="block text-xs font-semibold text-amber-900"
              >
                Mensaje (opcional)
              </label>
              <textarea
                id="cafe-caption"
                name="caption"
                rows={2}
                maxLength={500}
                placeholder="¿Qué estás compartiendo hoy?"
                className="mt-1.5 w-full rounded-xl border border-amber-200 bg-amber-50/30 px-3 py-2 text-sm text-slate-800 outline-none ring-amber-200 placeholder:text-slate-400 focus:border-amber-400 focus:ring-2"
              />
            </div>
            {state && !state.ok && state.error ? (
              <p className="text-sm text-red-600" role="alert">
                {state.error}
              </p>
            ) : null}
            {state?.ok ? (
              <p className="text-sm font-medium text-emerald-700" role="status">
                ¡Publicado! Ya aparece abajo.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-900/15 transition hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
            >
              {pending ? "Publicando…" : "Publicar"}
            </button>
          </form>
        </section>
      ) : (
        <p className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          <Link
            href="/login"
            className="font-semibold text-amber-800 underline-offset-2 hover:underline"
          >
            Inicia sesión
          </Link>{" "}
          para subir fotos y ver el muro del café.
        </p>
      )}

      <section aria-labelledby="cafe-muro">
        <h2
          id="cafe-muro"
          className="text-lg font-bold text-slate-800"
        >
          Muro del café
        </h2>
        {!isAuthenticated ? (
          <p className="mt-2 text-sm text-slate-600">
            El contenido solo está disponible para usuarios registrados.
          </p>
        ) : loadError ? (
          <p className="mt-3 text-sm text-slate-600">
            Cuando la base esté lista, las publicaciones aparecerán aquí.
          </p>
        ) : posts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Aún no hay publicaciones. ¡Sé el primero en compartir un momento!
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-6">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
