import type { ReactNode } from "react";
import { AlertCircle, Inbox } from "lucide-react";

export function AdminHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-700 via-zinc-600 to-zinc-900 px-6 py-7 text-white shadow-lg shadow-black/40">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 left-1/4 h-28 w-28 rounded-full bg-zinc-400/10 blur-2xl"
        aria-hidden
      />
      <h1 className="relative text-2xl font-bold tracking-tight sm:text-[1.65rem]">
        {title}
      </h1>
      <p className="relative mt-2 max-w-2xl text-sm leading-relaxed text-zinc-200/95">
        {subtitle}
      </p>
    </div>
  );
}

export function AdminTableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/40 shadow-[0_2px_8px_rgba(0,0,0,0.3)] ring-1 ring-zinc-600/40">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminTableThead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-zinc-700/80 bg-gradient-to-b from-zinc-800 to-zinc-900 text-left text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400">
        {children}
      </tr>
    </thead>
  );
}

export function AdminTh({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`px-4 py-3.5 ${className}`}>{children}</th>;
}

export function AdminTr({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-zinc-800/80 align-top transition-colors last:border-0 hover:bg-zinc-800/40">
      {children}
    </tr>
  );
}

export function AdminTd({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-4 ${className}`}>{children}</td>;
}

export function AdminWeekPill({ ymd }: { ymd: string }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-zinc-800 px-2.5 py-1 font-mono text-xs font-medium text-zinc-200 ring-1 ring-zinc-600/60">
      {ymd}
    </span>
  );
}

export function AdminErrorFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="mt-6 flex gap-3.5 rounded-2xl border border-zinc-600/80 bg-zinc-900/60 p-4 shadow-sm ring-1 ring-zinc-600/40"
      role="alert"
    >
      <AlertCircle
        className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400"
        strokeWidth={2}
        aria-hidden
      />
      <div className="min-w-0 flex-1 text-sm text-zinc-200">{children}</div>
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  code,
}: {
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 shadow-sm ring-1 ring-zinc-600/50">
        <Inbox className="h-6 w-6 text-zinc-500" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-100">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-zinc-400">{description}</p>
      <code className="mt-4 rounded-lg bg-zinc-950 px-3 py-1.5 font-mono text-xs text-zinc-300 shadow-sm ring-1 ring-zinc-700">
        {code}
      </code>
    </div>
  );
}

export function AdminCode({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <code
      className={`rounded-md bg-zinc-800/90 px-1.5 py-0.5 font-mono text-[0.8em] text-zinc-200 ${className}`}
    >
      {children}
    </code>
  );
}

export function AdminBadge({
  variant,
  children,
}: {
  variant: "success" | "muted";
  children: ReactNode;
}) {
  if (variant === "success") {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-700 px-2.5 py-0.5 text-xs font-semibold text-zinc-100 ring-1 ring-zinc-500/60">
        {children}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-xs font-medium text-zinc-400 ring-1 ring-zinc-600/60">
      {children}
    </span>
  );
}
