import { CardNoticia } from "@/components/CardNoticia";
import { getNoticias } from "@/services/api";
import { FaNewspaper } from "react-icons/fa";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const noticias = await getNoticias();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-3">
        <span className="bg-primary w-3 h-10 rounded-full inline-block"></span>
        <FaNewspaper className="h-8 w-8 text-primary" />
        Noticias Deportivas
      </h1>

      {noticias.length === 0 ? (
        <div className="border border-border/60 rounded-sm bg-card p-12 text-center text-muted-foreground font-medium">
          No hay noticias recientes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((noticia) => (
            <CardNoticia key={noticia.id} noticia={noticia} />
          ))}
        </div>
      )}
    </div>
  );
}
