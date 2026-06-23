import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 defaults images.qualities to [75], which over-softens the fine
    // UI text in project screenshots. Allow full quality for the covers.
    qualities: [75, 100],
  },
};

export default nextConfig;
