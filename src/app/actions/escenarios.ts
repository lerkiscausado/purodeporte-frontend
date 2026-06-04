"use server";

import { cookies } from "next/headers";

export async function createEscenario(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const direccion = formData.get("direccion") as string;
  const deporte = formData.get("deporte") as string;
  const barrioSector = formData.get("barrioSector") as string;
  const ubicacion = formData.get("ubicacion") as string;

  if (!nombre || !direccion || !deporte) {
    return { error: "Todos los campos obligatorios deben estar completos." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const response = await fetch(`${baseUrl}/escenarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre, direccion, deporte, barrioSector, ubicacion }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Error al crear el escenario. Intenta de nuevo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al crear escenario:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function updateEscenario(id: number, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const direccion = formData.get("direccion") as string;
  const deporte = formData.get("deporte") as string;
  const estado = formData.get("estado") as string;
  const barrioSector = formData.get("barrioSector") as string;
  const ubicacion = formData.get("ubicacion") as string;

  if (!nombre || !direccion || !deporte || !estado) {
    return { error: "Todos los campos obligatorios deben estar completos." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const response = await fetch(`${baseUrl}/escenarios/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre, direccion, deporte, estado, barrioSector, ubicacion }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Error al actualizar el escenario. Intenta de nuevo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar escenario:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function getEscenarios() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const response = await fetch(`${baseUrl}/escenarios`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Error al obtener escenarios. Intenta de nuevo.",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener escenarios:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

