import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaChartPie, FaTrophy, FaUsers, FaPenSquare, FaCalendarAlt, FaMapMarkerAlt, FaUserFriends, FaNewspaper } from "react-icons/fa";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  // Protección de ruta: Si no hay token, redirigir al login
  if (!sessionToken) {
    redirect("/login");
  }

  const userDataCookie = cookieStore.get("user_data");
  let user = { role: "user" };
  if (userDataCookie?.value) {
    try {
      user = JSON.parse(userDataCookie.value);
    } catch {}
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {/* Submenú del Dashboard — Navy Brand */}
      <div className="bg-[oklch(0.25_0.05_255)] border-b border-white/10 shadow-sm sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-3 gap-6 text-sm font-semibold text-white/60 hide-scrollbar">
            <Link href="/dashboard" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
              <FaChartPie /> Resumen
            </Link>
            <Link href="/dashboard/torneos" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
              <FaTrophy /> Mis Torneos
            </Link>
            <Link href="/dashboard/equipos" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
              <FaUserFriends /> Equipos
            </Link>
            <Link href="/dashboard/jugadores" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
              <FaUsers /> Jugadores
            </Link>
            <Link href="/dashboard/programacion" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
              <FaCalendarAlt /> Programación
            </Link>
            <Link href="/dashboard/resultados" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
              <FaPenSquare /> Resultados
            </Link>
            <Link href="/dashboard/escenarios" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
              <FaMapMarkerAlt /> Escenarios
            </Link>
            {user.role === "admin" && (
              <Link href="/dashboard/noticias" className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap">
                <FaNewspaper /> Noticias
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Contenido del Dashboard */}
      <div className="container mx-auto px-4 py-8 flex-1">
        {children}
      </div>
    </div>
  );
}

