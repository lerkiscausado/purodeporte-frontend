import { getNoticias } from "@/services/api";
import { NoticiasPublicListClient } from "@/app/noticias/NoticiasPublicListClient";
import { FaNewspaper, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Todas las Noticias | Puro Deporte",
  description: "Explora todas las noticias deportivas de tu barrio: fútbol, baloncesto, voleibol y más.",
};

export default async function TodasLasNoticiasPage() {
  const noticias = await getNoticias();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/noticias"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
        >
          <FaArrowLeft className="h-3 w-3" />
          Volver a Noticias
        </Link>
      </div>

      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-3">
        <span className="bg-primary w-3 h-10 rounded-full inline-block" />
        <FaNewspaper className="h-8 w-8 text-primary" />
        Noticias Deportivas
      </h1>

      <NoticiasPublicListClient initialNoticias={noticias} />
    </div>
  );
}
