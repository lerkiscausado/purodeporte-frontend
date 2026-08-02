import { cookies } from "next/headers";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { InscribirPlanillaClient } from "./InscribirPlanillaClient";
import { getApiUrl } from "@/lib/api-url";

interface PageProps {
  searchParams: Promise<{ id?: string; equipoId?: string }>;
}

export default async function InscribirPlanillaPage({ searchParams }: PageProps) {
  const { id, equipoId } = await searchParams;

  if (!id || !equipoId) {
    return (
      <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-sm text-destructive font-bold">
        Error: ID de torneo o de equipo no especificado.
      </div>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  let torneo: any = null;
  let equipo: any = null;
  let errorMsg = "";

  if (token) {
    try {
      const [resTorneo, resEquipo] = await Promise.all([
        fetch(getApiUrl(`torneos/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 0 },
        }),
        fetch(getApiUrl(`equipos/${equipoId}`), {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 0 },
        })
      ]);

      if (resTorneo.ok) {
        torneo = await resTorneo.json();
      } else {
        errorMsg = "No se pudieron obtener los detalles del torneo.";
      }

      if (resEquipo.ok) {
        equipo = await resEquipo.json();
      } else {
        errorMsg = errorMsg
          ? `${errorMsg} Tampoco se pudieron obtener los detalles del equipo.`
          : "No se pudieron obtener los detalles del equipo.";
      }
    } catch (error) {
      console.error("Error al cargar torneo o equipo para inscribir planilla:", error);
      errorMsg = "Error de conexión con el servidor.";
    }
  }

  if (errorMsg || !torneo || !equipo) {
    return (
      <div className="space-y-6">
        <Link
          href={`/dashboard/torneos/gestionar-torneo?id=${id || ""}&tab=equipos`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Gestión de Torneo
        </Link>
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive font-bold text-sm">
          {errorMsg || "No se pudo encontrar el torneo o equipo especificado."}
        </div>
      </div>
    );
  }

  return (
    <InscribirPlanillaClient
      torneo={torneo}
      equipo={equipo}
    />
  );
}
