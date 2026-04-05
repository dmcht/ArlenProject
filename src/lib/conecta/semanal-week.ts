import { getISOWeek, getISOWeekYear, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

/** Zona para calcular “qué semana calendario es”. Sobrescribe con APP_TIMEZONE en .env */
const DEFAULT_TZ = "America/Mexico_City";

const ACTIVIDADES_TOTAL = 8;

function calendarAnchorUtc(now: Date, timeZone: string): Date {
  const ymd = formatInTimeZone(now, timeZone, "yyyy-MM-dd");
  return parseISO(`${ymd}T12:00:00Z`);
}

function resolvedTimeZone(): string {
  const t = process.env.APP_TIMEZONE?.trim();
  return t && t.length > 0 ? t : DEFAULT_TZ;
}

/**
 * Índice 0..7 para rotar las 8 actividades: misma pregunta para todos durante esa semana ISO.
 */
export function getSemanalActivityIndex(now: Date = new Date()): number {
  const d = calendarAnchorUtc(now, resolvedTimeZone());
  const week = getISOWeek(d);
  return (week - 1) % ACTIVIDADES_TOTAL;
}

export type SemanalWeekMeta = {
  /** 1..8 según el banco de actividades */
  actividadNumero: number;
  semanaISO: number;
  anioISO: number;
  zona: string;
};

export function getSemanalWeekMeta(now: Date = new Date()): SemanalWeekMeta {
  const tz = resolvedTimeZone();
  const d = calendarAnchorUtc(now, tz);
  const semanaISO = getISOWeek(d);
  const anioISO = getISOWeekYear(d);
  const idx = (semanaISO - 1) % ACTIVIDADES_TOTAL;
  return {
    actividadNumero: idx + 1,
    semanaISO,
    anioISO,
    zona: tz,
  };
}
