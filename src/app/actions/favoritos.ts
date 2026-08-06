"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

/**
 * Adds a torneo to the authenticated user's favourites.
 */
export async function agregarFavorito(torneoId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: "No tienes una sesión activa." };
  }

  try {
    const response = await fetch(getApiUrl("favoritos"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ torneoId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "No se pudo agregar a favoritos.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    return {
      success: false,
      error: "Error de conexión con el servidor. Intenta nuevamente.",
    };
  }
}

/**
 * Removes a torneo from the authenticated user's favourites.
 */
export async function eliminarFavorito(torneoId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: "No tienes una sesión activa." };
  }

  try {
    const response = await fetch(getApiUrl(`favoritos/${torneoId}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "No se pudo quitar de favoritos.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    return {
      success: false,
      error: "Error de conexión con el servidor. Intenta nuevamente.",
    };
  }
}

/**
 * Returns the authenticated user's favourite torneos.
 * Returns an empty array when there is no active session or on any error —
 * this is intentional so unauthenticated pages can call it safely.
 */
export async function getMisFavoritos(): Promise<any[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  // Not logged in → return empty, never throw
  if (!token) return [];

  try {
    const response = await fetch(getApiUrl("favoritos/mis-favoritos"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
}
