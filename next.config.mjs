/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiBackend =
      process.env.API_BACKEND_URL || "http://89.117.53.108:8081";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBackend}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
