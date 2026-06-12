/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows importing from packages/shared without building first
  transpilePackages: ["@taskflow/shared"],
};

export default nextConfig;
