/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const isHostinger = process.env.HOSTINGER === "true";

const nextConfig = {
  reactStrictMode: true,
  output: (isGithubPages || isHostinger) ? "export" : undefined,
  basePath: isGithubPages ? "/Dashboard" : "",
  assetPrefix: isGithubPages ? "/Dashboard/" : "",
  images: {
    unoptimized: true,
    domains: ["logo.clearbit.com", "assets.nseindia.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "",
  },
};

module.exports = nextConfig;
