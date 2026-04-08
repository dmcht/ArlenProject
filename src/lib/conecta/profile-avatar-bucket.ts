export const PROFILE_AVATAR_BUCKET = "profile-avatars";

/** Límite más bajo que fotos del café: retratos pequeños. */
export const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const PROFILE_AVATAR_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
