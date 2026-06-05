import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import { TorneosListClient } from "./TorneosListClient";

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
      <TorneosListClient initialTorneos={torneos} />
    </div>
  );
}
