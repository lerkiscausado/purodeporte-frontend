import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaUserFriends, FaPlus } from "react-icons/fa";
import { EquiposListClient } from "./EquiposListClient";

export default async function EquiposListPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;

  let equipos: any[] = [];
  let errorMsg = "";

  if (token) {
    try {
      const response = await fetch(`${baseUrl}/equipos/mis-equipos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 },
      });

      if (response.ok) {
        equipos = await response.json();
      } else {
        errorMsg = "No se pudieron obtener tus equipos del servidor.";
      }
    } catch (error) {
      console.error("Error al cargar equipos:", error);
      errorMsg = "Error de conexión al obtener los equipos.";
    }
  }

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">Equipos</h1>
          <p className="text-muted-foreground text-sm">Gestiona y consulta los equipos registrados en la plataforma.</p>
        </div>
        <Link href="/dashboard/equipos/nuevo">
          <Button className="font-bold rounded-sm gap-2 bg-primary hover:bg-primary/95 text-primary-foreground border-none">
            <FaPlus className="h-4 w-4" />
            Nuevo Equipo
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
      {equipos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/10 rounded-sm space-y-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-sm bg-primary/10 text-primary">
            <FaUserFriends className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight">No tienes equipos registrados</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Registra a tus equipos deportivos y empieza a agregarlos a tus torneos.</p>
          </div>
          <Link href="/dashboard/equipos/nuevo">
            <Button className="font-bold rounded-sm gap-2">
              <FaPlus className="h-4 w-4" />
              Crear mi primer equipo
            </Button>
          </Link>
        </div>
      ) : (
        <EquiposListClient initialEquipos={equipos} baseUrl={baseUrl} />
      )}
    </div>
  );
}
