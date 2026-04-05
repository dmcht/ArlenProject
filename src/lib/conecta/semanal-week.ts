import { startOfISOWeek } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

/** Cookie: lunes de inicio del ciclo (actividad 1 esa semana). Se fija en la primera visita a /actividad. */
export const CICLO_LUNES_COOKIE = "conecta_ciclo_lunes";

/** Zona para el día calendario. Sobrescribe con APP_TIMEZONE en .env */
const DEFAULT_TZ = "America/Mexico_City";

const ACTIVIDADES_TOTAL = 8;
const MS_WEEK = 7 * 24 * 60 * 60 * 1000;

function calendarAnchorUtc(now: Date, timeZone: string): Date {
  const ymd = formatInTimeZone(now, timeZone, "yyyy-MM-dd");
  return new Date(`${ymd}T12:00:00Z`);
}

function resolvedTimeZone(): string {
  const t = process.env.APP_TIMEZONE?.trim();
  return t && t.length > 0 ? t : DEFAULT_TZ;
}

function parseOffset(): number {
  const n = Number.parseInt(process.env.SEMANAL_INDEX_OFFSET ?? "0", 10);
  return Number.isFinite(n) ? n : 0;
}

/** Lunes de la semana ISO que contiene `now` (en la zona de la app). */
export function isoWeekMondayYmd(now: Date = new Date()): string {
  const tz = resolvedTimeZone();
  const ref = calendarAnchorUtc(now, tz);
  const mon = startOfISOWeek(ref);
  return formatInTimeZone(mon, tz, "yyyy-MM-dd");
}

/** Valor a guardar en la cookie cuando aún no existe (primera visita a /actividad). */
export function getCicloLunesCookieValueForFirstVisit(now: Date = new Date()): string {
  return isoWeekMondayYmd(now);
}

export type SemanalOpts = {
  /** Cookie `conecta_ciclo_lunes` si existe (lunes de inicio del ciclo del usuario). */
  cicloLunesCookie?: string | null;
};

function anchorYmd(
  now: Date,
  tz: string,
  opts?: SemanalOpts,
): { ymd: string; fuente: "env" | "cookie" | "esta_semana" } {
  const env = process.env.ACTIVIDAD_SEMANAL_INICIO?.trim();
  if (env) {
    return { ymd: env, fuente: "env" };
  }
  const cookie = opts?.cicloLunesCookie?.trim();
  if (cookie) {
    return { ymd: cookie, fuente: "cookie" };
  }
  return { ymd: isoWeekMondayYmd(now), fuente: "esta_semana" };
}

function weeksSinceAnchor(
  now: Date,
  tz: string,
  anchorYmdStr: string,
): number {
  const d = calendarAnchorUtc(now, tz);
  const a = new Date(`${anchorYmdStr}T12:00:00Z`);
  let weeks = Math.floor((d.getTime() - a.getTime()) / MS_WEEK);
  if (weeks < 0) weeks = 0;
  return weeks;
}

/**
 * Índice 0..7. Actividad mostrada = índice + 1.
 * - Con `ACTIVIDAD_SEMANAL_INICIO` en .env: semanas desde esa fecha.
 * - Sin env: semanas desde el lunes en cookie `conecta_ciclo_lunes`, o desde el lunes ISO de esta semana si aún no hay cookie → **esa semana es siempre actividad 1**.
 */
export function getSemanalActivityIndex(
  now: Date = new Date(),
  opts?: SemanalOpts,
): number {
  const tz = resolvedTimeZone();
  const offset = parseOffset();
  const { ymd } = anchorYmd(now, tz, opts);
  const weeks = weeksSinceAnchor(now, tz, ymd);
  return ((weeks + offset) % ACTIVIDADES_TOTAL + ACTIVIDADES_TOTAL) %
    ACTIVIDADES_TOTAL;
}

export type SemanalWeekMeta = {
  actividadNumero: number;
  semanaEtiqueta: string;
  detalleCiclo: string;
  zona: string;
};

export function getSemanalWeekMeta(
  now: Date = new Date(),
  opts?: SemanalOpts,
): SemanalWeekMeta {
  const tz = resolvedTimeZone();
  const offset = parseOffset();
  const { ymd, fuente } = anchorYmd(now, tz, opts);
  const weeks = weeksSinceAnchor(now, tz, ymd);
  const idx = getSemanalActivityIndex(now, opts);
  const act = idx + 1;

  let semanaEtiqueta: string;
  let detalleCiclo: string;

  if (fuente === "env") {
    semanaEtiqueta = `Ciclo fijo desde ${ymd}`;
    detalleCiclo =
      "Definido con ACTIVIDAD_SEMANAL_INICIO en .env. Semana 1 del ciclo = actividad 1.";
  } else if (fuente === "cookie") {
    semanaEtiqueta = `Semana ${weeks + 1} del ciclo`;
    detalleCiclo =
      "Tu ciclo empezó el lunes guardado en tu navegador. Cada semana nueva suma una actividad (1…8) y luego vuelve a empezar.";
  } else {
    semanaEtiqueta = "Primera semana de tu ciclo";
    detalleCiclo =
      "Es la primera vez que entras o no teníamos fecha guardada: esta semana es la actividad 1. Al volver la próxima semana, seguirá el ciclo.";
  }

  if (offset !== 0) {
    detalleCiclo += ` (SEMANAL_INDEX_OFFSET=${offset})`;
  }

  return {
    actividadNumero: act,
    semanaEtiqueta,
    detalleCiclo,
    zona: tz,
  };
}
