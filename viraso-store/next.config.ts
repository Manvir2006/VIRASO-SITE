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
        source: "/refunds-cancellations",
        destination: "/return-cancellation",
        permanent: true,
      },
      {
        source: "/refund-policy",
        destination: "/return-cancellation",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/terms-and-conditions",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/shipping",
        destination: "/shipping-policy",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/support/contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
