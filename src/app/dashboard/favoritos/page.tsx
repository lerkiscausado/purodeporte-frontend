import { getMisFavoritos } from "@/app/actions/favoritos";
import { FavoritosClient } from "./FavoritosClient";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  const favoritos = await getMisFavoritos();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-2.5">
            <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
            Mis Torneos Favoritos
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Accede rápidamente a los torneos que sigues y mantente al día con sus resultados y programación.
          </p>
        </div>
      </div>

      <FavoritosClient initialFavoritos={favoritos} />
    </div>
  );
}
