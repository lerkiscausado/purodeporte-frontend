"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

export async function getPeriodosPorPartido(partidoId: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`partidoperiodos/partido/${partidoId}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Error al obtener los periodos del partido." };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener periodos del partido:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function getPeriodosPublicosPorPartido(partidoId: number) {
  try {
    const response = await fetch(
      getApiUrl(`partidoperiodos/partido/${partidoId}/public`),
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
    console.error("Error al obtener periodos públicos del partido:", error);
    return [];
  }
}

export async function createPartidoPeriodo(dto: {
  idPartido: number;
  nombrePeriodo: string;
  tipoPeriodo: string;
  scoreLocal: number;
  scoreVisitante: number;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("partidoperiodos"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message)
        ? errorData.message.join(". ")
        : errorData.message;
      return {
        error: msg || "Error al registrar el periodo del partido. Intenta de nuevo.",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear periodo del partido:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function updatePartidoPeriodo(
  id: number,
  dto: {
    idPartido?: number;
    nombrePeriodo?: string;
    tipoPeriodo?: string;
    scoreLocal?: number;
    scoreVisitante?: number;
  }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`partidoperiodos/${id}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message)
        ? errorData.message.join(". ")
        : errorData.message;
      return {
        error: msg || "Error al actualizar el periodo del partido. Intenta de nuevo.",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar periodo del partido:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function deletePartidoPeriodo(id: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`partidoperiodos/${id}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Error al eliminar el periodo del partido.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar periodo del partido:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}
