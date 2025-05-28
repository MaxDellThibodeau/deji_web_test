/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; frame-src 'self' https://js.stripe.com https://checkout.stripe.com; connect-src 'self' https://api.stripe.com; img-src 'self' data: https://*.stripe.com; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
};

export default nextConfig;
