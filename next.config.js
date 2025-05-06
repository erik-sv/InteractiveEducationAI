/** @type {import('next').NextConfig} */
const nextConfig = {
  telemetry: false,
  // Add assetPrefix and basePath configuration based on environment
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // Use trailingSlash to ensure consistent URL handling
  trailingSlash: false,
}

module.exports = nextConfig
