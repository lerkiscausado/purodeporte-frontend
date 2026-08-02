"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

export async function createPartido(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const fecha = formData.get("fecha") as string;
    const horaInput = formData.get("hora") as string; // Ej: "15:00"
    const idTorneoStr = formData.get("idTorneo") as string;
    const idEquipoLocalStr = formData.get("idEquipoLocal") as string;
    const idEquipoVisitanteStr = formData.get("idEquipoVisitante") as string;
    const idEscenarioStr = formData.get("idEscenario") as string;
    const descripcion = (formData.get("descripcion") as string) || "";
    const tipoJuego = (formData.get("tipoJuego") as string) || "OFICIAL";

    if (!fecha || !horaInput || !idTorneoStr || !idEquipoLocalStr || !idEquipoVisitanteStr) {
      return { error: "La fecha, hora, torneo y ambos equipos son obligatorios." };
    }

    const idTorneo = parseInt(idTorneoStr, 10);
    const idEquipoLocal = parseInt(idEquipoLocalStr, 10);
    const idEquipoVisitante = parseInt(idEquipoVisitanteStr, 10);

    if (isNaN(idTorneo) || isNaN(idEquipoLocal) || isNaN(idEquipoVisitante)) {
      return { error: "Los identificadores de torneo y equipos deben ser válidos." };
    }

    if (idEquipoLocal === idEquipoVisitante) {
      return { error: "El equipo local y el equipo visitante no pueden ser el mismo." };
    }

    let hora = horaInput;
    if (hora.length === 5) {
      hora = `${hora}:00`;
    }

    const body: Record<string, any> = {
      fecha,
      hora,
      idTorneo,
      idEquipoLocal,
      idEquipoVisitante,
      descripcion,
      tipoJuego,
    };

    if (idEscenarioStr && idEscenarioStr !== "ninguno" && idEscenarioStr !== "") {
      const idEscenario = parseInt(idEscenarioStr, 10);
      if (!isNaN(idEscenario)) {
        body.idEscenario = idEscenario;
      }
    }

    const response = await fetch(getApiUrl("partidos"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message)
        ? errorData.message.join(". ")
        : errorData.message;
      return {
        error: msg || "Error al programar el partido. Intenta de nuevo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al programar partido:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function getPartido(id: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`partidos/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Error al obtener el partido." };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener partido:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function updatePartido(id: number, data: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`partidos/${id}`), {
      method: "PATCH",
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
      return { error: msg || "Error al actualizar el partido. Intenta de nuevo." };
    }

    const resData = await response.json();
    return { success: true, data: resData };
  } catch (error) {
    console.error("Error al actualizar partido:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}
