/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["etherscan.io"],
        remotePatterns: [
          {
            protocol: "https",
            hostname: "**",
          },
        ],
      },
};

export default nextConfig;
