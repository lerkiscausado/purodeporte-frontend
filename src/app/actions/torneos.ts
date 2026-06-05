"use server";

import { cookies } from "next/headers";

export async function createTorneo(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    // Send the FormData directly to the backend. Fetch with FormData automatically
    // constructs a multipart/form-data request with the proper boundary and headers.
    const response = await fetch(`${baseUrl}/torneos`, {
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
        error: msg || "Error al crear el torneo. Intenta de nuevo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al crear torneo:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function updateTorneo(id: number, data: { name: string; estado: string }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const response = await fetch(`${baseUrl}/torneos/${id}`, {
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
      return {
        error: msg || "Error al actualizar el torneo. Intenta de nuevo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar torneo:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

