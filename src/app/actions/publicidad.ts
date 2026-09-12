"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { Publicidad } from "@/types";

export async function getPublicidadAdmin(): Promise<Publicidad[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return [];
    }

    const response = await fetch(getApiUrl("publicidad"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error("Error al obtener publicidad (admin):", error);
    return [];
  }
}

export async function getPublicidadVigente(): Promise<Array<{ id: number; imagen: string; link: string }>> {
  try {
    const response = await fetch(getApiUrl("publicidad/vigente/public"), {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error("Error al obtener publicidad vigente:", error);
    return [];
  }
}

export async function createPublicidad(
  prevStateOrFormData: any,
  formDataArg?: FormData
): Promise<{ error?: string; success?: boolean }> {
  const formData =
    formDataArg instanceof FormData
      ? formDataArg
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  if (!formData) {
    return { error: "Formulario inválido." };
  }

  const link = formData.get("link") as string;
  const fechaInicio = formData.get("fechaInicio") as string;
  const fechaFin = formData.get("fechaFin") as string;
  const imagen = formData.get("imagen") as File | null;

  if (!link || !fechaInicio || !fechaFin) {
    return { error: "Los campos enlace, fecha de inicio y fecha de fin son obligatorios." };
  }

  if (!imagen || !(imagen instanceof File) || imagen.size === 0) {
    return { error: "La imagen publicitaria es obligatoria." };
  }

  if (new Date(fechaFin) < new Date(fechaInicio)) {
    return { error: "La fecha de fin no puede ser anterior a la fecha de inicio." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("publicidad"), {
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
        error: msg || "Error al registrar la publicidad. Intenta de nuevo.",
      };
    }

    revalidatePath("/dashboard/publicidad");
    return { success: true };
  } catch (error) {
    console.error("Error al crear publicidad:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function updatePublicidad(
  id: number,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const link = formData.get("link") as string;
  const fechaInicio = formData.get("fechaInicio") as string;
  const fechaFin = formData.get("fechaFin") as string;

  if (!link || !fechaInicio || !fechaFin) {
    return { error: "Los campos enlace, fecha de inicio y fecha de fin son obligatorios." };
  }

  if (new Date(fechaFin) < new Date(fechaInicio)) {
    return { error: "La fecha de fin no puede ser anterior a la fecha de inicio." };
  }

  // Si no se seleccionó una nueva imagen, remover el campo vacío para no sobreescribir la imagen existente
  const imagen = formData.get("imagen");
  if (imagen instanceof File && imagen.size === 0) {
    formData.delete("imagen");
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`publicidad/${id}`), {
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
        error: msg || "Error al actualizar la publicidad. Intenta de nuevo.",
      };
    }

    revalidatePath("/dashboard/publicidad");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar publicidad:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function deletePublicidad(
  id: number
): Promise<{ error?: string; success?: boolean }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`publicidad/${id}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Error al eliminar la publicidad.",
      };
    }

    revalidatePath("/dashboard/publicidad");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar publicidad:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}
