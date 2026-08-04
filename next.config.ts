import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
