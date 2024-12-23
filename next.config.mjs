/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverRuntimeConfig: {
    host: "0.0.0.0",
  },
  output: 'standalone',
};

export default nextConfig;
