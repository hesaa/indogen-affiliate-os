/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactStrictMode: true,
    serverComponentsExternalPackages: ['lucide-react'],
    optimizePackageImports: true,
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'res-1.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com https://res-1.cloudinary.com; connect-src 'self'; frame-src 'none';",
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    config.optimization.minimizer.forEach((minimizer) => {
      if (minimizer.options) {
        minimizer.options.terserOptions = {
          ...minimizer.options.terserOptions,
          compress: {
            ...minimizer.options.terserOptions.compress,
            drop_console: true,
          },
        };
      }
    });
    return config;
  },
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;