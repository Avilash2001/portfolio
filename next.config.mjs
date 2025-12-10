/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { hostname: "icon.icepanel.io" },
      { hostname: "cdn.worldvectorlogo.com" },
      { hostname: "uxwing.com" },
      { hostname: "www.svgrepo.com" },
    ],
  },
};

export default nextConfig;
