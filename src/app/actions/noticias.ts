"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";

export async function getNoticiasAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("noticias"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Error al obtener las noticias." };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener noticias (admin):", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function createNoticia(formData: FormData) {
  const titulo = formData.get("titulo") as string;
  const subtitulo = formData.get("subtitulo") as string;
  const descripcion = formData.get("descripcion") as string;
  const deporte = formData.get("deporte") as string;

  if (!titulo || !subtitulo || !descripcion || !deporte) {
    return { error: "Los campos título, subtítulo, descripción y deporte son obligatorios." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("noticias"), {
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
        error: msg || "Error al registrar la noticia. Intenta de nuevo.",
      };
    }

    revalidatePath("/dashboard/noticias");
    return { success: true };
  } catch (error) {
    console.error("Error al crear noticia:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function updateNoticia(id: number, formData: FormData) {
  const titulo = formData.get("titulo") as string;
  const subtitulo = formData.get("subtitulo") as string;
  const descripcion = formData.get("descripcion") as string;
  const deporte = formData.get("deporte") as string;

  if (!titulo || !subtitulo || !descripcion || !deporte) {
    return { error: "Los campos título, subtítulo, descripción y deporte son obligatorios." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`noticias/${id}`), {
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
        error: msg || "Error al actualizar la noticia. Intenta de nuevo.",
      };
    }

    revalidatePath("/dashboard/noticias");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}

export async function deleteNoticia(id: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl(`noticias/${id}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Error al eliminar la noticia.",
      };
    }

    revalidatePath("/dashboard/noticias");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    return { error: "Error de conexión con el servidor. Intenta de nuevo." };
  }
}
