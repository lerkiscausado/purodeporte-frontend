"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

export async function createTorneo(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("torneos"), {
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

    const response = await fetch(getApiUrl(`torneos/${id}`), {
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
