import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import { EscenariosListClient } from "./EscenariosListClient";
import { getApiUrl } from "@/lib/api-url";

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

  let escenarios: any[] = [];
  let errorMsg = "";

  if (token) {
    try {
      const response = await fetch(getApiUrl("escenarios"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 },
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

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">Escenarios Deportivos</h1>
          <p className="text-muted-foreground text-sm">Gestiona e inspecciona las canchas y complejos deportivos disponibles.</p>
        </div>
        <Link href="/dashboard/escenarios/nuevo">
          <Button className="font-bold rounded-sm gap-2 bg-primary hover:bg-primary/95 text-primary-foreground border-none">
            <FaPlus className="h-4 w-4" />
            Nuevo Escenario
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
      <EscenariosListClient initialEscenarios={escenarios} isAdmin={isAdmin} />
    </div>
  );
}
