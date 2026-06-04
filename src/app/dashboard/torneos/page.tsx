import { cookies } from "next/headers";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaTrophy,
  FaCalendarAlt,
  FaDownload,
  FaPlus,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaTableTennis,
  FaUserFriends,
  FaShieldAlt,
  FaEdit,
  FaMapMarkerAlt
} from "react-icons/fa";


export default async function TorneosListPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

  let torneos: any[] = [];
  let errorMsg = "";

  if (token) {
    try {
      const response = await fetch(`${baseUrl}/torneos/mis-torneos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 }, // Evitar caché para datos en tiempo real
      });

      if (response.ok) {
        torneos = await response.json();
      } else {
        errorMsg = "No se pudieron obtener tus torneos del servidor.";
      }
    } catch (error) {
      console.error("Error al cargar torneos:", error);
      errorMsg = "Error de conexión al obtener los torneos.";
    }
  }

  // Mapear iconos por deporte
  const getSportIcon = (deporte: string) => {
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer")) {
      return <FaFutbol className="h-4 w-4 text-emerald-500" />;
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return <FaBasketballBall className="h-4 w-4 text-orange-500" />;
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return <FaVolleyballBall className="h-4 w-4 text-indigo-500" />;
    }
    if (dep.includes("tenis") || dep.includes("ping")) {
      return <FaTableTennis className="h-4 w-4 text-yellow-500" />;
    }
    return <FaTrophy className="h-4 w-4 text-primary" />;
  };

  // Mapear colores de badge según el estado
  const statusColors: Record<string, string> = {
    "En Juego": "bg-green-500/10 text-green-500 border-green-500/20",
    "Creado": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Finalizado": "bg-muted text-muted-foreground border-border/60",
  };

  // Formatear periodo de fechas
  const formatPeriod = (startStr: string, endStr: string) => {
    if (!startStr) return "—";
    try {
      const startDate = new Date(startStr);
      const startDay = startDate.getDate();
      const startMonth = startDate.toLocaleDateString("es-CO", { month: "short" });

      if (!endStr) {
        return `Desde ${startDay} ${startMonth}, ${startDate.getFullYear()}`;
      }

      const endDate = new Date(endStr);
      const endDay = endDate.getDate();
      const endMonth = endDate.toLocaleDateString("es-CO", { month: "short" });

      return `${startDay} ${startMonth} — ${endDay} ${endMonth}, ${endDate.getFullYear()}`;
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">Mis Torneos</h1>
          <p className="text-muted-foreground text-sm">Gestiona y consulta los torneos de los que eres organizador.</p>
        </div>
        <Link href="/dashboard/torneos/nuevo">
          <Button className="font-bold rounded-sm gap-2 bg-primary hover:bg-primary/95 text-primary-foreground border-none">
            <FaPlus className="h-4 w-4" />
            Nuevo Torneo
          </Button>
        </Link>
      </div>

      {/* Alerta de Error */}
      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive font-bold text-sm">
          {errorMsg}
        </div>
      )}

      {/* Contenido / Listado */}
      {torneos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/10 rounded-sm space-y-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-sm bg-primary/10 text-primary">
            <FaTrophy className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight">No tienes torneos registrados</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Comienza creando tu primer torneo oficial y organiza los partidos en Puro Deporte.</p>
          </div>
          <Link href="/dashboard/torneos/nuevo">
            <Button className="font-bold rounded-sm gap-2">
              <FaPlus className="h-4 w-4" />
              Crear mi primer torneo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {torneos.map((torneo) => (
            <Card
              key={torneo.id}
              className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden flex flex-col hover:border-r-border/80 transition-all"
            >


              {/* Contenido de la tarjeta */}
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Fila superior: Deporte + Rama + Estado */}
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getSportIcon(torneo.deporte)}
                      <span className="truncate">{torneo.deporte}</span>
                      <span>•</span>
                      <span>{torneo.rama}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm border text-[9px] ${statusColors[torneo.estado] || statusColors["Creado"]}`}>
                      {torneo.estado}
                    </span>
                  </div>

                  {/* Nombre del torneo */}
                  <h3 className="text-base font-black tracking-tight uppercase line-clamp-2 leading-tight" title={torneo.name}>
                    {torneo.name}
                  </h3>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Rango de Fechas */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <FaCalendarAlt className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{formatPeriod(torneo.fechaInicio, torneo.fechaFin)}</span>
                  </div>


                  {/* Escenario Asignado */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <FaMapMarkerAlt className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    <span className="truncate text-foreground font-bold" title={torneo.escenario?.nombre || "Sin escenario asignado"}>
                      {torneo.escenario ? (
                        torneo.escenario.nombre
                      ) : (
                        <span className="italic text-muted-foreground/60 font-medium">Sin escenario principal</span>
                      )}
                    </span>
                  </div>

                </div>

                {/* Acciones */}
                <div className="pt-2 border-t border-border/50">
                  <Link href={`/dashboard/torneos/gestionar-torneo?id=${torneo.id}`} className="w-full block">
                    <Button className="w-full font-bold rounded-sm h-10 bg-[oklch(0.25_0.05_255)] text-white hover:bg-[oklch(0.30_0.07_255)] border-none text-[11px] uppercase tracking-wider">
                      <FaEdit className="h-4 w-4" />
                      Gestionar Torneo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
