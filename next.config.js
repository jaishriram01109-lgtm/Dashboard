/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? "export" : "standalone",
  basePath: isGithubPages ? "/Dashboard" : "",
  assetPrefix: isGithubPages ? "/Dashboard/" : "",
  images: {
    unoptimized: true,
    domains: ["logo.clearbit.com", "assets.nseindia.com"],
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "replicate.delivery" },
      { protocol: "https", hostname: "pbxt.replicate.delivery" },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "",
  },
};

module.exports = nextConfig;
