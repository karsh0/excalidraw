/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // Ensure this is enabled for the App Router
  },
  webpack: (config) => {
    // Remove any manual `mini-css-extract-plugin` config
    return config;
  },
};

module.exports = nextConfig;
