import { Noticia } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface CardNoticiaProps {
  noticia: Noticia;
}

export function CardNoticia({ noticia }: CardNoticiaProps) {
  return (
    <Link href={`/noticias/${noticia.id}`}>
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
          <time className="text-[11px] text-primary font-semibold tracking-wide">
            {new Date(noticia.fecha).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </time>
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
