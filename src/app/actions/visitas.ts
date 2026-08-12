"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

export interface EstadisticasVisitas {
  totalVisitas: number;
  visitasHoy: number;
  visitasUltimos7Dias: number;
  visitasUltimos30Dias: number;
  rutasMasVisitadas: { ruta: string; cantidad: number }[];
}

/**
 * Registra una visita a una ruta de la plataforma.
 * Es un endpoint público (no requiere autenticación).
 * Nunca lanza excepciones: si falla, la experiencia del usuario no se ve afectada.
 */
export async function registrarVisita(ruta: string): Promise<void> {
  try {
    await fetch(getApiUrl("visitas/registrar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruta }),
    });
  } catch {
    // Silenciosamente ignorado — registrar una visita nunca debe romper la UX.
  }
}

/**
 * Obtiene las estadísticas de visitas del sitio.
 * Solo disponible para administradores.
 * Retorna null si el usuario no es admin, no hay sesión, o si hay un error de red.
 */
export async function getEstadisticasVisitas(): Promise<EstadisticasVisitas | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) return null;

    const response = await fetch(getApiUrl("visitas/estadisticas"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return null;

    return (await response.json()) as EstadisticasVisitas;
  } catch {
    return null;
  }
}
