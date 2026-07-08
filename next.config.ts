import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* All product images are served from /public/products — no remote patterns needed */
  // @ts-ignore - allowedDevOrigins is suggested by the Next.js 16 error message but might not be in types yet
  allowedDevOrigins: ["172.17.0.24", "localhost:3000"],
};

export default nextConfig;
