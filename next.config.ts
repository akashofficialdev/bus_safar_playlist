import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.207", "192.168.1.11"],
  devIndicators: false,
};

export default nextConfig;
