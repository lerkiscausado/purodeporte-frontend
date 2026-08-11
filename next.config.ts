import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      // Aumentado a 10 MB para permitir el envío de imágenes + HTML del editor
      // mediante Server Actions (el límite por defecto de Next.js es 1 MB).
      // Consistente con los límites configurados en Nginx y el backend.
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Nota: Dominio de producción para imágenes subidas a la plataforma (uploads).
        // Si el dominio principal cambia en el futuro, debe actualizarse aquí manualmente.
        protocol: 'https',
        hostname: 'purodeporte.co',
      },
    ],
  },
};

export default nextConfig;
