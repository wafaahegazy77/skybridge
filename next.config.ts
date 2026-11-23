import type { NextConfig } from "next";

// Deployed on a Node.js server (not a static export), so image optimization is enabled.
const nextConfig: NextConfig = {
  reactCompiler: true,
  // Existing URL behaviour: all routes end with a trailing slash.
  trailingSlash: true,
  poweredByHeader: false,
};

export default nextConfig;
