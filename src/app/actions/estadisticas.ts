"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

export async function getTiposEstadisticaPorDeporte(deporte: string) {
  try {
    const response = await fetch(
      getApiUrl(`tipos-estadistica/deporte/${encodeURIComponent(deporte)}`),
      {
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error al obtener tipos de estadística:", error);
    return [];
  }
}

export async function registrarEstadistica(data: {
  jugadorId: number;
  partidoId: number;
  equipoId: number;
  tipoEstadisticaId: number;
  cantidad: number;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("estadisticas"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message)
        ? errorData.message.join(". ")
        : errorData.message;
      return {
        error: msg || "Error al registrar la estadística.",
      };
    }

    const resData = await response.json();
    return { success: true, data: resData };
  } catch (error) {
    console.error("Error al registrar estadística:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function eliminarEstadistica(id: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`estadisticas/${id}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Error al eliminar la estadística.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar estadística:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function getEstadisticasPorPartido(partidoId: number) {
  try {
    const response = await fetch(getApiUrl(`estadisticas/partido/${partidoId}`), {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error al obtener estadísticas del partido:", error);
    return [];
  }
}

export async function getLideresPorTorneo(
  torneoId: number,
  tipoEstadisticaId?: number
) {
  try {
    const query = tipoEstadisticaId ? `?tipoEstadisticaId=${tipoEstadisticaId}` : "";
    const response = await fetch(
      getApiUrl(`estadisticas/torneo/${torneoId}/lideres${query}`),
      {
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error al obtener líderes del torneo:", error);
    return [];
  }
}
