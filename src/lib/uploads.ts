/**
 * Helper utility para construir URLs completas de archivos subidos (imágenes, PDFs, etc.)
 * servidos por Nginx/backend bajo /uploads/
 */

const DEFAULT_PLACEHOLDER =
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop";

export function getUploadUrl(
  subfolder: string,
  filename?: string | null,
  fallbackUrl: string = DEFAULT_PLACEHOLDER
): string {
  if (!filename) {
    return fallbackUrl;
  }

  // Si ya es una URL completa
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");

  const cleanSubfolder = subfolder.replace(/^\/+|\/+$/g, "");
  const cleanFilename = filename.replace(/^\/+/g, "");

  return `${baseUrl}/uploads/${cleanSubfolder}/${cleanFilename}`;
}
