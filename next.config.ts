import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Deployed on a Node.js server (not a static export), so image optimization is enabled.
const nextConfig: NextConfig = {
  reactCompiler: true,
  // Existing URL behaviour: all routes end with a trailing slash.
  trailingSlash: true,
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
