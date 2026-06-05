import { cookies } from "next/headers";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaRunning,
  FaTrophy,
  FaArrowRight,
  FaExternalLinkAlt
} from "react-icons/fa";
import { EditEscenarioModal } from "@/components/EditEscenarioModal";

export default async function EscenariosListPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const userDataCookie = cookieStore.get("user_data");

  let user = { name: "Usuario", email: "", role: "user", phone: "" };
  if (userDataCookie?.value) {
    try {
      user = JSON.parse(userDataCookie.value);
    } catch { }
  }

  const isAdmin = user.role === "admin";

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

  let escenarios: any[] = [];
  let errorMsg = "";

  if (token) {
    try {
      const response = await fetch(`${baseUrl}/escenarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 }, // Evitar caché para datos en tiempo real
      });

      if (response.ok) {
        escenarios = await response.json();
      } else {
        errorMsg = "No se pudieron obtener los escenarios del servidor.";
      }
    } catch (error) {
      console.error("Error al cargar escenarios:", error);
      errorMsg = "Error de conexión al obtener los escenarios.";
    }
  }

  // Mapear iconos pequeños por tipo de deporte
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
    if (dep.includes("multiuso")) {
      return <FaRunning className="h-4 w-4 text-blue-500" />;
    }
    return <FaTrophy className="h-4 w-4 text-primary" />;
  };

  // Mapear iconos gigantes rotados para el banner de fondo
  const getSportIconLarge = (deporte: string) => {
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer")) {
      return <FaFutbol className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-500/10 rotate-12" />;
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return <FaBasketballBall className="absolute -right-4 -bottom-4 h-24 w-24 text-orange-500/10 rotate-12" />;
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return <FaVolleyballBall className="absolute -right-4 -bottom-4 h-24 w-24 text-indigo-500/10 rotate-12" />;
    }
    return <FaRunning className="absolute -right-4 -bottom-4 h-24 w-24 text-blue-500/10 rotate-12" />;
  };

  // Obtener color/degradado del banner según el deporte
  const getSportBannerGradient = (deporte: string) => {
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer")) {
      return "from-emerald-500/15 via-emerald-600/5 to-transparent";
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return "from-orange-500/15 via-orange-600/5 to-transparent";
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return "from-indigo-500/15 via-indigo-600/5 to-transparent";
    }
    return "from-blue-500/15 via-blue-600/5 to-transparent";
  };

  // Mapear colores de badge según la disponibilidad
  const statusColors: Record<string, string> = {
    "Disponible": "bg-green-500/10 text-green-500 border-green-500/20",
    "No Disponible": "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">Escenarios Deportivos</h1>
          <p className="text-muted-foreground text-sm">Gestiona e inspecciona las canchas y complejos deportivos disponibles.</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/escenarios/nuevo">
            <Button className="font-bold rounded-sm gap-2 bg-primary hover:bg-primary/95 text-primary-foreground border-none">
              <FaPlus className="h-4 w-4" />
              Nuevo Escenario
            </Button>
          </Link>
        )}
      </div>

      {/* Alerta de Error */}
      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive font-bold text-sm">
          {errorMsg}
        </div>
      )}

      {/* Contenido / Listado */}
      {escenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/10 rounded-sm space-y-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-sm bg-primary/10 text-primary">
            <FaMapMarkerAlt className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight">No hay escenarios registrados</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Registra las instalaciones físicas donde se llevarán a cabo los encuentros deportivos.</p>
          </div>
          {isAdmin && (
            <Link href="/dashboard/escenarios/nuevo">
              <Button className="font-bold rounded-sm gap-2">
                <FaPlus className="h-4 w-4" />
                Registrar mi primer escenario
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escenarios.map((escenario) => (
            <Card
              key={escenario.id}
              className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden flex flex-col hover:border-r-border/80 transition-all"
            >


              {/* Contenido de la tarjeta */}
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Fila superior: Deporte + Tipo + Estado */}
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getSportIcon(escenario.deporte)}
                      <span className="truncate">{escenario.deporte}</span>
                      <span>•</span>
                      <span>Instalación</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-wider ${statusColors[escenario.estado] || statusColors["Disponible"]}`}>
                      {escenario.estado}
                    </span>
                  </div>

                  {/* Nombre */}
                  <h3 className="text-base font-black tracking-tight uppercase line-clamp-2 leading-tight" title={escenario.nombre}>
                    {escenario.nombre}
                  </h3>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Dirección y ubicación */}
                  <div className="space-y-2 text-xs font-semibold text-muted-foreground">
                    {escenario.ubicacion ? (
                      <a
                        href={escenario.ubicacion.startsWith("http") ? escenario.ubicacion : `https://maps.google.com/?q=${encodeURIComponent(escenario.ubicacion)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/loc flex items-start gap-2.5 p-2 -mx-2 rounded-sm hover:bg-sky-500/5 border border-transparent hover:border-sky-500/10 transition-all duration-200"
                        title="Ver en Google Maps"
                      >
                        <FaMapMarkerAlt className="h-4 w-4 text-sky-500 shrink-0 mt-0.5 group-hover/loc:scale-110 group-hover/loc:animate-pulse transition-transform" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="line-clamp-1 text-foreground font-bold group-hover/loc:text-sky-500 group-hover/loc:underline transition-colors" title={escenario.direccion}>
                            {escenario.direccion}
                          </span>
                          {escenario.barrioSector && (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium mt-0.5">
                              Sector: {escenario.barrioSector}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-sky-500 uppercase tracking-widest mt-1">
                            Ver Mapa <FaExternalLinkAlt className="h-2 w-2 opacity-70 group-hover/loc:translate-x-0.5 group-hover/loc:-translate-y-0.5 transition-transform" />
                          </span>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-start gap-2.5 p-2 -mx-2">
                        <FaMapMarkerAlt className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
                        <div className="flex flex-col min-w-0">
                          <span className="line-clamp-1 text-foreground font-bold" title={escenario.direccion}>
                            {escenario.direccion}
                          </span>
                          {escenario.barrioSector && (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium mt-0.5">
                              Sector: {escenario.barrioSector}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                {isAdmin && (
                  <div className="pt-2 border-t border-border/50">
                    <EditEscenarioModal
                      escenarioId={escenario.id}
                      escenarioNombre={escenario.nombre}
                      escenarioDireccion={escenario.direccion}
                      escenarioDeporte={escenario.deporte}
                      escenarioEstado={escenario.estado}
                      escenarioBarrioSector={escenario.barrioSector}
                      escenarioUbicacion={escenario.ubicacion}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
