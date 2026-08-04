import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getNoticiasAdmin } from "@/app/actions/noticias";
import { NoticiasListClient } from "./NoticiasListClient";

export const dynamic = "force-dynamic";

export default async function NoticiasDashboardPage() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("user_data");

  let user = { role: "user" };
  if (userDataCookie?.value) {
    try {
      user = JSON.parse(userDataCookie.value);
    } catch {}
  }

  // Protección de rol: Solo administradores pueden gestionar noticias
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const result = await getNoticiasAdmin();
  const noticias = result.data || [];

  return <NoticiasListClient initialNoticias={noticias} />;
}
