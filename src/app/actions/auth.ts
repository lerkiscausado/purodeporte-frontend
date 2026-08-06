"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiUrl } from "@/lib/api-url";

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "El email y la contraseña son requeridos." };
  }

  let isSuccess = false;

  try {
    const response = await fetch(getApiUrl("users/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        error: errorData.message || "Credenciales incorrectas. Verifica tu email y contraseña." 
      };
    }

    const data = await response.json();

    if (data.access_token) {
      const cookieStore = await cookies();
      
      cookieStore.set("session_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
      });

      cookieStore.set("user_data", JSON.stringify(data.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
      });

      isSuccess = true;
    } else {
      return { error: "Respuesta inválida del servidor. No se recibió el token." };
    }
  } catch (error) {
    console.error("Error en login:", error);
    return { error: "Error de conexión con el servidor. Intenta nuevamente más tarde." };
  }

  if (isSuccess) {
    redirect("/dashboard");
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  cookieStore.delete("user_data");
  redirect("/");
}

export async function register(formData: FormData) {
  const email = formData.get("email");
  const phone = formData.get("phone");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const name = formData.get("name");
  // 'organizador' | 'seguidor' — maps to MANAGER / USER on the backend
  const tipoUsuario = (formData.get("tipoUsuario") as string) || "seguidor";

  if (!email || !password || !confirmPassword || !phone || !name) {
    return { error: "Todos los campos son requeridos." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  let isSuccess = false;

  try {
    const response = await fetch(getApiUrl("users/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, phone, password, name, tipoUsuario }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        error: errorData.message || "Error al registrar el usuario. Es posible que el correo ya esté en uso." 
      };
    }

    isSuccess = true;
  } catch (error) {
    console.error("Error en registro:", error);
    return { error: "Error de conexión con el servidor. Intenta nuevamente más tarde." };
  }

  if (isSuccess) {
    redirect("/login?registered=true");
  }
}

/**
 * Activates the current user as an Organizador.
 * Calls PATCH /api/users/tipo-usuario with { tipoUsuario: "organizador" },
 * updates the user_data cookie with the new role returned by the API,
 * then redirects to /dashboard so the full layout loads immediately.
 */
export async function activarOrganizador() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { error: "No tienes una sesión activa. Inicia sesión nuevamente." };
  }

  try {
    const response = await fetch(getApiUrl("users/tipo-usuario"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tipoUsuario: "organizador" }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "No se pudo activar la cuenta. Intenta nuevamente.",
      };
    }

    const updatedUser = await response.json();

    // Merge new role into the existing user_data cookie
    const existing = cookieStore.get("user_data")?.value;
    let userData: Record<string, unknown> = {};
    try {
      userData = existing ? JSON.parse(existing) : {};
    } catch {}

    const merged = { ...userData, ...updatedUser };

    cookieStore.set("user_data", JSON.stringify(merged), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (error) {
    console.error("Error activando organizador:", error);
    return { error: "Error de conexión con el servidor. Intenta nuevamente más tarde." };
  }

  // Redirect outside the try/catch so Next.js redirect() works correctly
  redirect("/dashboard");
}

export async function verifyEmail(token: string) {
  if (!token) {
    return { success: false, message: "Enlace de verificación inválido." };
  }

  try {
    const response = await fetch(getApiUrl("users/verify-email"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "El enlace de verificación no es válido o ha expirado.",
      };
    }

    return {
      success: true,
      message: data.message || "¡Tu correo electrónico ha sido verificado exitosamente!",
    };
  } catch (error) {
    console.error("Error en verificación de correo:", error);
    return {
      success: false,
      message: "Error de conexión con el servidor. Intenta nuevamente más tarde.",
    };
  }
}

export async function resendVerification(email: string) {
  if (!email || !email.trim()) {
    return { message: "Ingresa un correo electrónico válido." };
  }

  try {
    const response = await fetch(getApiUrl("users/resend-verification"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));
    return {
      message:
        data.message ||
        "Si el correo existe en nuestro sistema, hemos enviado un enlace de verificación. Revisa tu bandeja de entrada.",
    };
  } catch (error) {
    console.error("Error al reenviar correo de verificación:", error);
    return {
      message: "Error de conexión con el servidor. Intenta nuevamente más tarde.",
    };
  }
}

export async function forgotPassword(email: string) {
  if (!email || !email.trim()) {
    return { message: "Ingresa un correo electrónico válido." };
  }

  try {
    const response = await fetch(getApiUrl("users/forgot-password"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));
    return {
      message:
        data.message ||
        "Si la cuenta existe en nuestro sistema, hemos enviado un enlace de recuperación. Revisa tu bandeja de entrada.",
    };
  } catch (error) {
    console.error("Error en solicitud de recuperación de contraseña:", error);
    return {
      message: "Error de conexión con el servidor. Intenta nuevamente más tarde.",
    };
  }
}

export async function resetPassword(token: string, password: string) {
  if (!token) {
    return { success: false, message: "Enlace de recuperación inválido." };
  }
  if (!password) {
    return { success: false, message: "La contraseña es requerida." };
  }

  try {
    const response = await fetch(getApiUrl("users/reset-password"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "El enlace de recuperación no es válido o ha expirado.",
      };
    }

    return {
      success: true,
      message: data.message || "Tu contraseña ha sido restablecida exitosamente.",
    };
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    return {
      success: false,
      message: "Error de conexión con el servidor. Intenta nuevamente más tarde.",
    };
  }
}

