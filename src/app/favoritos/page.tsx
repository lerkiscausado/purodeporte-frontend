import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Trophy, Heart } from "lucide-react";
import { ActivarOrganizadorButton } from "@/components/ActivarOrganizadorButton";
import { getMisFavoritos } from "@/app/actions/favoritos";
import { FavoritosClient } from "@/components/FavoritosClient";

export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
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

  const favoritos = await getMisFavoritos();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl flex-1">
      {/* Seguidor Banner + Activation CTA (solo si role === 'user') */}
      {user.role === "user" && (
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
      )}

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
  );
}
