import type { NextConfig } from "next";

function supabaseImageRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    const host = new URL(url).hostname;
    return [
      {
        protocol: "https",
        hostname: host,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImageRemotePatterns(),
  },
  // Fotos del café (hasta 5 MB en cafe-actions) pasan por Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
