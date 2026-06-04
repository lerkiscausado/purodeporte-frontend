import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaUsers, FaPlus } from "react-icons/fa";
import { JugadoresListClient } from "./JugadoresListClient";

export default async function JugadoresListPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

  let jugadores: any[] = [];
  let errorMsg = "";

  if (token) {
    try {
      const response = await fetch(`${baseUrl}/jugadores`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 },
      });

      if (response.ok) {
        jugadores = await response.json();
      } else {
        errorMsg = "No se pudieron obtener los jugadores del servidor.";
      }
    } catch (error) {
      console.error("Error al cargar jugadores:", error);
      errorMsg = "Error de conexión al obtener los jugadores.";
    }
  }

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">Jugadores</h1>
          <p className="text-muted-foreground text-sm">Consulta y gestiona los jugadores registrados en la plataforma.</p>
        </div>
        <Link href="/dashboard/jugadores/nuevo">
          <Button className="font-bold rounded-sm gap-2 bg-primary hover:bg-primary/95 text-primary-foreground border-none">
            <FaPlus className="h-4 w-4" />
            Nuevo Jugador
          </Button>
        </Link>
      </div>

      {/* Alerta de Error */}
      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive font-bold text-sm">
          {errorMsg}
        </div>
      )}

      {/* Contenido */}
      {jugadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/10 rounded-sm space-y-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-sm bg-primary/10 text-primary">
            <FaUsers className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight">No hay jugadores registrados</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Registra a los deportistas que participarán en tus torneos y competencias.</p>
          </div>
          <Link href="/dashboard/jugadores/nuevo">
            <Button className="font-bold rounded-sm gap-2">
              <FaPlus className="h-4 w-4" />
              Registrar mi primer jugador
            </Button>
          </Link>
        </div>
      ) : (
        <JugadoresListClient initialJugadores={jugadores} baseUrl={baseUrl} />
      )}
    </div>
  );
}
