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
      body: JSON.stringify({ email, phone, password, name }),
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
