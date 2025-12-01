import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: 'https://localhost:7147/api/v1',
  },
};

export default nextConfig;