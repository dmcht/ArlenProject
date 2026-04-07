/** Lista separada por comas o punto y coma. Ej: ADMIN_EMAILS=admin@empresa.com,otro@empresa.com */
export function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS?.trim() ?? "";
  if (!raw) return new Set();
  return new Set(
    raw
      .split(/[,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = parseAdminEmails();
  if (admins.size === 0) return false;
  return admins.has(email.trim().toLowerCase());
}
