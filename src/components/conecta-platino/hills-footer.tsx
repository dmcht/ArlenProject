export function HillsFooter() {
  return (
    <div className="pointer-events-none relative mt-1 h-24 w-full shrink-0 overflow-hidden sm:h-28">
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-zinc-950/90 to-transparent" />
      <svg
        className="absolute bottom-0 left-0 w-full text-zinc-700"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          fillOpacity={0.35}
          d="M0 80 L0 45 Q60 20 120 38 T240 32 T360 42 L400 28 L400 80 Z"
        />
        <path
          fill="currentColor"
          fillOpacity={0.55}
          d="M0 80 L0 52 Q80 35 160 48 T320 40 L400 48 L400 80 Z"
        />
        <path
          fill="currentColor"
          fillOpacity={0.75}
          d="M0 80 L0 58 Q100 48 200 58 T400 52 L400 80 Z"
        />
      </svg>
      <div className="absolute bottom-14 left-[12%] h-5 w-9 rounded-full bg-zinc-500/20 shadow-sm ring-1 ring-white/10" />
      <div className="absolute bottom-16 right-[18%] h-4 w-7 rounded-full bg-zinc-400/15 shadow-sm ring-1 ring-white/10" />
    </div>
  );
}
