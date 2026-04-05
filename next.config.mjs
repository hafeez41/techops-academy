/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tree-shake large icon/animation packages at build time
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  images: {
    // Serve modern formats (WebP/AVIF) automatically
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "jkmljlyqjjxlsddswrps.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
