import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/refund-cancellation",
        destination: "/return-cancellation",
        permanent: true,
      },
      {
        source: "/refund-policy",
        destination: "/return-cancellation",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
