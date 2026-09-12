import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPublicidadAdmin } from "@/app/actions/publicidad";
import { PublicidadListClient } from "./PublicidadListClient";

export const dynamic = "force-dynamic";

export default async function PublicidadDashboardPage() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("user_data");

  let user = { role: "user" };
  if (userDataCookie?.value) {
    try {
      user = JSON.parse(userDataCookie.value);
    } catch {}
  }

  // Protección de rol: Solo administradores pueden gestionar publicidad
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const publicidad = await getPublicidadAdmin();

  return <PublicidadListClient initialPublicidad={publicidad} />;
}
