import Image from "next/image";

const sizeClass = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
} as const;

const sizePx = {
  sm: 32,
  md: 40,
  lg: 56,
} as const;

export function UserAvatar({
  avatarUrl,
  label,
  size = "md",
}: {
  avatarUrl: string | null;
  label: string;
  size?: keyof typeof sizeClass;
}) {
  const dim = sizePx[size];
  const ring = "shrink-0 overflow-hidden rounded-full ring-1 ring-zinc-600/80";

  if (avatarUrl) {
    return (
      <span className={`relative ${sizeClass[size]} ${ring}`}>
        <Image
          src={avatarUrl}
          alt=""
          width={dim}
          height={dim}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={`flex ${sizeClass[size]} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 text-sm font-bold text-white shadow-sm`}
      aria-hidden
    >
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
}
