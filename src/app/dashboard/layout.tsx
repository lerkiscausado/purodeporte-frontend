import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FaChartPie,
  FaTrophy,
  FaUsers,
  FaPenSquare,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserFriends,
  FaNewspaper,
  FaHeart,
} from "react-icons/fa";
import { Trophy, Heart } from "lucide-react";

import { ActivarOrganizadorButton } from "@/components/ActivarOrganizadorButton";
import { getMisFavoritos } from "@/app/actions/favoritos";
import { FavoritosClient } from "./favoritos/FavoritosClient";

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
  let user: { role: string; name?: string } = { role: "user" };
  if (userDataCookie?.value) {
    try {
      user = JSON.parse(userDataCookie.value);
    } catch {}
  }

  // ── Seguidor layout ──────────────────────────────────────────────────────────
  // Users with role='user' (seguidores) view their Favoritos as main content,
  // accompanied by an option/banner to activate an Organizador account.
  if (user.role === "user") {
    const favoritos = await getMisFavoritos();

    return (
      <div className="flex flex-col min-h-screen bg-muted/20">
        <div className="container mx-auto px-4 py-8 space-y-8 flex-1 max-w-6xl">
          {/* Seguidor Banner + Activation CTA */}
          <div className="bg-card border border-border/60 border-l-4 border-l-primary rounded-sm p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-sm bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Trophy className="h-3.5 w-3.5" />
                Cuenta Seguidor / Aficionado
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                ¿Quieres organizar tus propios torneos?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Activa tu cuenta de Organizador para crear torneos, inscribir equipos, administrar jugadores y publicar resultados.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <ActivarOrganizadorButton />
            </div>
          </div>

          {/* Main content: Mis Torneos Favoritos */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-2.5">
                  <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
                  Mis Torneos Favoritos
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                  Sigue los partidos, la tabla de posiciones y la información de tus torneos guardados.
                </p>
              </div>
            </div>

            <FavoritosClient initialFavoritos={favoritos} />
          </div>
        </div>
      </div>
    );
  }

  // ── Normal dashboard for manager / admin ───────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {/* Submenú del Dashboard — Navy Brand */}
      <div className="bg-[oklch(0.25_0.05_255)] border-b border-white/10 shadow-sm sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-3 gap-6 text-sm font-semibold text-white/60 hide-scrollbar">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
            >
              <FaChartPie /> Resumen
            </Link>
            <Link
              href="/dashboard/favoritos"
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
            >
              <FaHeart className="text-rose-400" /> Mis Favoritos
            </Link>
            <Link
              href="/dashboard/torneos"
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
            >
              <FaTrophy /> Mis Torneos
            </Link>
            <Link
              href="/dashboard/equipos"
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
            >
              <FaUserFriends /> Equipos
            </Link>
            <Link
              href="/dashboard/jugadores"
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
            >
              <FaUsers /> Jugadores
            </Link>
            <Link
              href="/dashboard/programacion"
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
            >
              <FaCalendarAlt /> Programación
            </Link>
            <Link
              href="/dashboard/resultados"
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
            >
              <FaPenSquare /> Resultados
            </Link>
            <Link
              href="/dashboard/escenarios"
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
            >
              <FaMapMarkerAlt /> Escenarios
            </Link>
            {user.role === "admin" && (
              <Link
                href="/dashboard/noticias"
                className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              >
                <FaNewspaper /> Noticias
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Contenido del Dashboard */}
      <div className="container mx-auto px-4 py-8 flex-1">{children}</div>
    </div>
  );
}
