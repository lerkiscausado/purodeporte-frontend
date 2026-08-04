"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

export async function updateProfile(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmNewPassword = formData.get("confirmNewPassword") as string;

  if (!name || !phone) {
    return { error: "El nombre y el teléfono son requeridos." };
  }

  if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
    return { error: "Para cambiar la contraseña, debes ingresar la contraseña actual y la nueva." };
  }

  if (newPassword && newPassword !== confirmNewPassword) {
    return { error: "Las contraseñas nuevas no coinciden." };
  }

  if (newPassword) {
    formData.set("password", newPassword);
  }

  // Eliminar entrada vacía de foto si no se adjuntó archivo
  const fotoFile = formData.get("foto");
  if (fotoFile instanceof File && fotoFile.size === 0) {
    formData.delete("foto");
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const response = await fetch(getApiUrl("users/profile"), {
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
        error: msg || "Error al actualizar el perfil. Intenta nuevamente.",
      };
    }

    const updatedUser = await response.json();

    cookieStore.set("user_data", JSON.stringify(updatedUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return { error: "Error de conexión con el servidor. Intenta nuevamente más tarde." };
  }
}

