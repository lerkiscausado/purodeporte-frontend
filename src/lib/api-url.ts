/**
 * Retorna la URL completa para un endpoint de la API.
 * Garantiza que el prefijo `/api` esté siempre presente para alinearse con el backend (NestJS).
 *
 * Ejemplo de uso:
 *   getApiUrl("/users/login") -> "http://localhost:3000/api/users/login"
 *   getApiUrl("torneos")      -> "http://localhost:3000/api/torneos"
 */
export function getApiUrl(path: string = ""): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  let baseUrl = envUrl.replace(/\/+$/, "");
  if (!baseUrl.endsWith("/api")) {
    baseUrl = `${baseUrl}/api`;
  }
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
}
