"use server";

import { cookies } from "next/headers";

export async function createEquipo(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const representante = formData.get("representante") as string;
  const deporte = formData.get("deporte") as string;
  const foto = formData.get("foto") as string || "";
  const estado = formData.get("estado") as string || "Activo";
  const telefono = formData.get("telefono") as string || "";
  const correo = formData.get("correo") as string || "";

  if (!nombre || !representante || !deporte) {
    return { error: "Los campos nombre, representante y deporte son obligatorios." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const body: Record<string, any> = { nombre, representante, deporte, foto, estado };
    if (telefono) body.telefono = telefono;
    if (correo) body.correo = correo;

    const response = await fetch(`${baseUrl}/equipos`, {
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
  const foto = formData.get("foto") as string || "";
  const estado = formData.get("estado") as string;
  const telefono = formData.get("telefono") as string;
  const correo = formData.get("correo") as string;

  if (!nombre || !representante || !deporte) {
    return { error: "Los campos nombre, representante y deporte son obligatorios." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const body: Record<string, any> = { nombre, representante, deporte, foto };
    if (estado) {
      body.estado = estado;
    }
    if (telefono !== null && telefono !== undefined) {
      body.telefono = telefono;
    }
    if (correo !== null && correo !== undefined) {
      body.correo = correo;
    }

    const response = await fetch(`${baseUrl}/equipos/${id}`, {
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const response = await fetch(`${baseUrl}/equipos/${id}`, {
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const response = await fetch(`${baseUrl}/equipos`, {
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const response = await fetch(`${baseUrl}/equipos/mis-equipos`, {
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const response = await fetch(`${baseUrl}/equipos/${id}`, {
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


