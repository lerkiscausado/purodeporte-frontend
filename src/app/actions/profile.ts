"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

export async function updateProfile(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const genero = formData.get("genero") as string;
  const fechaNacimiento = formData.get("fechaNacimiento") as string;
  const direccion = formData.get("direccion") as string;
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

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
    }

    const body: Record<string, any> = { 
      name, 
      phone,
      genero: genero || null,
      fechaNacimiento: fechaNacimiento || null,
      direccion: direccion || null,
    };
    
    if (newPassword) {
      body.password = newPassword;
    }

    const response = await fetch(getApiUrl("users/profile"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Error al actualizar el perfil. Intenta nuevamente.",
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
