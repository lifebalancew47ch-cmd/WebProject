/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    // Requerido para poder usar next/image en un export 100% estático: no
    // hay servidor propio que sirva /_next/image, así que se desactiva la
    // optimización on-demand y next/image solo aporta lo que sí puede dar
    // sin servidor (width/height reservados -> sin CLS, lazy loading nativo).
    unoptimized: true,
    // Hosts externos usados en WatchProductSection.tsx (fotos reales de
    // listados de MercadoLibre/Amazon, ver docs/SECURITY.md).
    remotePatterns: [
      { protocol: 'https', hostname: 'http2.mlstatic.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
    ],
  },
}
export default nextConfig
