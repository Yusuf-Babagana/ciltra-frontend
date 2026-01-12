/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent-los2-1.xx.fbcdn.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig