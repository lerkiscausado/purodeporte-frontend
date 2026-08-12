import { Noticia } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { FaFutbol, FaBasketballBall, FaVolleyballBall, FaNewspaper } from "react-icons/fa";

interface CardNoticiaProps {
  noticia: Noticia;
}

export function getNoticiaSportIcon(deporte?: string) {
  if (!deporte) return <FaNewspaper className="h-3.5 w-3.5 text-primary shrink-0" />;
  const dep = deporte.toLowerCase();
  if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer")) {
    return <FaFutbol className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
  }
  if (dep.includes("basket") || dep.includes("baloncesto")) {
    return <FaBasketballBall className="h-3.5 w-3.5 text-orange-500 shrink-0" />;
  }
  if (dep.includes("voley") || dep.includes("voleibol")) {
    return <FaVolleyballBall className="h-3.5 w-3.5 text-indigo-500 shrink-0" />;
  }
  return <FaNewspaper className="h-3.5 w-3.5 text-primary shrink-0" />;
}

export function CardNoticia({ noticia }: CardNoticiaProps) {
  return (
    <Link href={`/noticias/${noticia.slug || noticia.id}`}>
      <article className="group border-l-4 border-l-primary/50 bg-card border border-border/60 rounded-sm overflow-hidden hover:border-border transition-all duration-150 mb-4">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={noticia.imagenUrl}
            alt={noticia.titulo}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        </div>
        <div className="p-3.5">
          <div className="flex items-center gap-1.5">
            {getNoticiaSportIcon(noticia.deporte)}
            <time className="text-[11px] text-primary font-semibold tracking-wide">
              {new Date(noticia.fecha).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </time>
          </div>
          <h3 className="text-sm font-bold leading-snug mt-1 group-hover:text-primary transition-colors line-clamp-2">
            {noticia.titulo}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {noticia.resumen}
          </p>
        </div>
      </article>
    </Link>
  );
}
