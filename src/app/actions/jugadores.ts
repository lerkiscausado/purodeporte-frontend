"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

export async function createJugador(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const apellidos = formData.get("apellidos") as string;
  const genero = formData.get("genero") as string;
  const fechaNacimiento = formData.get("fechaNacimiento") as string;
  const estaturaRaw = formData.get("estatura") as string;
  const identificacion = formData.get("identificacion") as string;
  const estado = formData.get("estado") as string;

  if (!nombre || !apellidos || !genero || !fechaNacimiento || !estaturaRaw || !identificacion) {
    return { error: "Los campos nombre, apellidos, género, fecha de nacimiento, estatura e identificación son obligatorios." };
  }

  const estatura = parseFloat(estaturaRaw);
  if (isNaN(estatura)) {
    return { error: "La estatura debe ser un valor numérico." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const body: Record<string, any> = { nombre, apellidos, genero, fechaNacimiento, estatura };
    if (identificacion) {
      body.identificacion = identificacion;
    }
    if (estado) {
      body.estado = estado;
    }

    const response = await fetch(getApiUrl("jugadores"), {
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
        error: msg || "Error al registrar el jugador. Intenta de nuevo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al crear jugador:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function updateJugador(id: number, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const apellidos = formData.get("apellidos") as string;
  const genero = formData.get("genero") as string;
  const fechaNacimiento = formData.get("fechaNacimiento") as string;
  const estaturaRaw = formData.get("estatura") as string;
  const identificacion = formData.get("identificacion") as string;
  const estado = formData.get("estado") as string;

  if (!nombre || !apellidos || !genero || !fechaNacimiento || !estaturaRaw || !identificacion) {
    return { error: "Los campos nombre, apellidos, género, fecha de nacimiento, estatura e identificación son obligatorios." };
  }

  const estatura = parseFloat(estaturaRaw);
  if (isNaN(estatura)) {
    return { error: "La estatura debe ser un valor numérico." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const body: Record<string, any> = { nombre, apellidos, genero, fechaNacimiento, estatura };
    if (identificacion) {
      body.identificacion = identificacion;
    }
    if (estado) {
      body.estado = estado;
    }

    const response = await fetch(getApiUrl(`jugadores/${id}`), {
      method: "PATCH",
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
        error: msg || "Error al actualizar el jugador. Intenta de nuevo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar jugador:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function deleteJugador(id: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`jugadores/${id}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Error al eliminar el jugador.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar jugador:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function getJugadores() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("jugadores"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Error al obtener los jugadores." };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}
