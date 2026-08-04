import { getNoticias } from "@/services/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NoticiaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const noticias = await getNoticias();
  const noticia = noticias.find((n) => String(n.id) === String(id));

  if (!noticia) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link
        href="/noticias"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider mb-6"
      >
        <FaArrowLeft className="h-3 w-3" /> Volver a Noticias
      </Link>

      <article className="bg-card border border-border/60 rounded-sm overflow-hidden shadow-lg">
        {noticia.imagenUrl && (
          <div className="relative h-72 md:h-96 w-full">
            <Image
              src={noticia.imagenUrl}
              alt={noticia.titulo}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-wide">
            <FaCalendarAlt className="h-3.5 w-3.5" />
            <time>
              {new Date(noticia.fecha).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>

          <h1 className="text-2xl md:text-4xl font-black leading-tight text-foreground">
            {noticia.titulo}
          </h1>

          {noticia.resumen && (
            <p className="text-lg md:text-xl font-semibold text-foreground/80 leading-snug">
              {noticia.resumen}
            </p>
          )}

          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-base pt-4 border-t border-border/40 whitespace-pre-line">
            {noticia.descripcion}
          </div>
        </div>
      </article>
    </div>
  );
}
