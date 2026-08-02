"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

export async function getInscripcionesPorTorneo(torneoId: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`inscripciones/torneo/${torneoId}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Error al obtener las inscripciones del torneo." };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener inscripciones:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function createInscripcion(idTorneo: number, idEquipo: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("inscripciones"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ idTorneo, idEquipo }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message)
        ? errorData.message.join(". ")
        : errorData.message;
      return {
        error: msg || "Error al inscribir el equipo. Intenta de nuevo.",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al inscribir equipo:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function deleteInscripcion(id: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`inscripciones/${id}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Error al eliminar la inscripción." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar inscripción:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}
