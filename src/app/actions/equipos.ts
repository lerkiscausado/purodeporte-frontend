"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

export async function createEquipo(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const representante = formData.get("representante") as string;
  const deporte = formData.get("deporte") as string;

  if (!nombre || !representante || !deporte) {
    return { error: "Los campos nombre, representante y deporte son obligatorios." };
  }

  if (!formData.has("estado") || !formData.get("estado")) {
    formData.set("estado", "Activo");
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("equipos"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message)
        ? errorData.message.join(". ")
        : errorData.message;
      return {
        error: msg || "Error al registrar el equipo. Intenta de nuevo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al crear equipo:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function updateEquipo(id: number, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const representante = formData.get("representante") as string;
  const deporte = formData.get("deporte") as string;

  if (!nombre || !representante || !deporte) {
    return { error: "Los campos nombre, representante y deporte son obligatorios." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`equipos/${id}`), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message)
        ? errorData.message.join(". ")
        : errorData.message;
      return {
        error: msg || "Error al actualizar el equipo. Intenta de nuevo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar equipo:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function deleteEquipo(id: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`equipos/${id}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Error al eliminar el equipo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar equipo:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function getEquipos() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("equipos"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Error al obtener la lista de equipos." };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener equipos:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function getMisEquipos() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("equipos/mis-equipos"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Error al obtener la lista de tus equipos." };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener mis equipos:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function getEquipo(id: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`equipos/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || `Error al obtener el equipo con ID ${id}.` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`Error al obtener equipo ${id}:`, error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}
