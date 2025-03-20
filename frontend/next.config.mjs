/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 2000,
      aggregateTimeout: 300,
      ignored: /node_module/,
    };
    return config;
  },
};

export default nextConfig;
