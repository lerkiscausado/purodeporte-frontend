"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "El email y la contraseña son requeridos." };
  }

  let isSuccess = false;

  try {
    // Consumir el API usando la URL de entorno o por defecto localhost:3000
    // Si tienes otra ruta en tu env.local, asegúrate de que coincida con tu API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    // Eliminamos "/api" del final de la URL si está presente, ya que el usuario 
    // indicó que la ruta directa es /users/login
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const response = await fetch(`${baseUrl}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // Si el API retorna error (ej. 401 Unauthorized)
      const errorData = await response.json().catch(() => ({}));
      return { 
        error: errorData.message || "Credenciales incorrectas. Verifica tu email y contraseña." 
      };
    }

    const data = await response.json();

    if (data.access_token) {
      // Si es correcto, guardar el token en una cookie segura
      const cookieStore = await cookies();
      
      cookieStore.set("session_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
      });

      // Opcional: Guardar los datos del usuario en otra cookie o manejar estado
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

  // Next.js redirect arroja un error especial, por lo que debe llamarse fuera del try/catch
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

    const response = await fetch(`${baseUrl}/users/register`, {
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

    // Opcional: si el registro devuelve login directo, podríamos guardarlo. 
    // Pero asumo que el flujo es redirigir al login.
    isSuccess = true;
  } catch (error) {
    console.error("Error en registro:", error);
    return { error: "Error de conexión con el servidor. Intenta nuevamente más tarde." };
  }

  // Redirigir al login si es exitoso
  if (isSuccess) {
    redirect("/login?registered=true");
  }
}
