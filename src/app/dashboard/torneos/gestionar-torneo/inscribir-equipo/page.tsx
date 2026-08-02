import { cookies } from "next/headers";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { InscribirEquipoClient } from "./InscribirEquipoClient";
import { getApiUrl } from "@/lib/api-url";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function InscribirEquipoPage({ searchParams }: PageProps) {
  const { id } = await searchParams;

  if (!id) {
    return (
      <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-sm text-destructive font-bold">
        Error: ID de torneo no especificado.
      </div>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  let torneo: any = null;
  let errorMsg = "";

  if (token) {
    try {
      const response = await fetch(getApiUrl(`torneos/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 },
      });

      if (response.ok) {
        torneo = await response.json();
      } else {
        errorMsg = "No se pudieron obtener los detalles del torneo.";
      }
    } catch (error) {
      console.error("Error al cargar torneo para inscribir equipo:", error);
      errorMsg = "Error de conexión con el servidor.";
    }
  }

  if (errorMsg || !torneo) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/torneos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Torneos
        </Link>
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive font-bold text-sm">
          {errorMsg || "No se pudo encontrar el torneo especificado."}
        </div>
      </div>
    );
  }

  return (
    <InscribirEquipoClient
      torneo={torneo}
    />
  );
}
