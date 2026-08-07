import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { getMisFavoritos } from "@/app/actions/favoritos";
import { mapTorneoBackendToTorneo } from "@/services/api";
import { FavoritosListClient } from "@/components/FavoritosListClient";

export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  // Protección de ruta: Si no hay token, redirigir al login
  if (!sessionToken) {
    redirect("/login");
  }

  const rawFavoritos = await getMisFavoritos();
  const favoritosMapeados = rawFavoritos.map((item: any) => mapTorneoBackendToTorneo(item.torneo || item));

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl flex-1">
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

        <FavoritosListClient initialFavoritos={favoritosMapeados} />
      </div>
    </div>
  );
}
