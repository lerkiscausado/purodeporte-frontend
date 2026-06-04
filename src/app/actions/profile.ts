"use server";

import { cookies } from "next/headers";

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

  // Si quiere cambiar contraseña, todos los campos son requeridos
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    // Construir el body del request
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

    const response = await fetch(`${baseUrl}/users/profile`, {
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

    // Actualizar la cookie user_data con los nuevos datos
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
