import { getNoticias, getResultados } from "@/services/api";
import { CardNoticia } from "@/components/CardNoticia";
import { TablaResultados } from "@/components/TablaResultados";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FaNewspaper } from "react-icons/fa";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Noticias | Puro Deporte",
  description: "Últimas noticias deportivas, resultados recientes y titulares de tu barrio.",
};

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default async function NoticiasPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  const [allNoticias, allResultados] = await Promise.all([
    getNoticias(),
    getResultados(),
  ]);

  // Ordenar noticias por fecha desc (defensive sort)
  const noticiasOrdenadas = [...allNoticias].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  // 5 más recientes para la columna central
  const noticiasRecientes = noticiasOrdenadas.slice(0, 5);

  // 10 para titulares en col 3
  const titulares = noticiasOrdenadas.slice(0, 10);

  // Resultados de hoy y ayer
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  const resultadosRecientes = allResultados.filter((p) => {
    const fechaPartido = new Date(p.fecha);
    return isSameDay(fechaPartido, hoy) || isSameDay(fechaPartido, ayer);
  });

  return (
    <div className="container mx-auto px-4 py-10 field-texture">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6 lg:gap-8">

        {/* ── COL 1: TARJETA DE PRESENTACIÓN (25%) ─────────────────── */}
        <div className="space-y-4">
          <div className="bg-card border border-border/60 rounded-sm shadow-sm p-5 space-y-4">
            {/* Cabecera */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/15 text-primary border border-primary/25 px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3">
                <FaNewspaper className="h-3 w-3" />
                Noticias
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground marca-line mb-1">
                Puro Deporte
              </h1>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Torneos, resultados y noticias de tu barrio.
              </p>
            </div>

            {/* Separador */}
            <div className="border-t border-border/40" />

            {/* CTA según sesión */}
            {sessionToken ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Bienvenido de vuelta 👋
                </p>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    size: "sm",
                    className: "w-full justify-start gap-2 font-bold rounded-sm",
                  })}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Ir al Dashboard
                </Link>
                <Link
                  href="/favoritos"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full justify-start gap-2 font-bold rounded-sm",
                  })}
                >
                  <Heart className="h-3.5 w-3.5" />
                  Mis Favoritos
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Únete a la comunidad deportiva.
                </p>
                <Link
                  href="/register"
                  className={buttonVariants({
                    size: "sm",
                    className: "w-full font-bold rounded-sm shadow-sm shadow-primary/20",
                  })}
                >
                  Crear Cuenta
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full font-bold rounded-sm",
                  })}
                >
                  Entrar
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── COL 2: NOTICIAS RECIENTES + RESULTADOS (50%) ─────────── */}
        <div className="lg:border-x lg:border-border/60 lg:px-8 space-y-10">

          {/* Sección: Últimas Noticias */}
          <section>
            <div className="flex items-center justify-between mb-5 border-t border-border/40 pt-4">
              <h2 className="text-lg font-extrabold marca-line">Últimas Noticias</h2>
              <Link
                href="/noticias/todas"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-primary font-semibold text-xs h-7 px-2",
                })}
              >
                Ver todas <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>

            {noticiasRecientes.length === 0 ? (
              <div className="border border-border/60 rounded-sm bg-card p-6 text-center text-sm text-muted-foreground font-medium">
                No hay noticias recientes.
              </div>
            ) : (
              <div className="space-y-7">
                {noticiasRecientes.map((noticia) => (
                  <CardNoticia key={noticia.id} noticia={noticia} />
                ))}
              </div>
            )}

            {/* Link "Ver todas" al final */}
            <div className="mt-6 text-center">
              <Link
                href="/noticias/todas"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "font-bold rounded-sm gap-2",
                })}
              >
                Ver todas las noticias <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>

          {/* Sección: Resultados Recientes */}
          <section>
            <div className="flex items-center justify-between mb-4 border-t border-border/40 pt-4">
              <h2 className="text-lg font-extrabold marca-line">Resultados Recientes</h2>
              <Link
                href="/resultados"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-primary font-semibold text-xs h-7 px-2",
                })}
              >
                Todos <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>

            {resultadosRecientes.length === 0 ? (
              <div className="border border-border/60 rounded-sm bg-card p-6 text-center text-sm text-muted-foreground font-medium">
                No hay resultados en los últimos 2 días.
              </div>
            ) : (
              <TablaResultados partidos={resultadosRecientes} />
            )}
          </section>
        </div>

        {/* ── COL 3: TITULARES (25%) ────────────────────────────────── */}
        <div>
          <section className="border-t border-border/40 pt-4">
            <h2 className="text-lg font-extrabold marca-line mb-4">Titulares</h2>
            <div className="bg-card border border-border/60 rounded-sm shadow-sm overflow-hidden">
              {titulares.length === 0 ? (
                <p className="text-xs text-muted-foreground font-medium p-4 text-center">
                  No hay titulares disponibles.
                </p>
              ) : (
                <ul>
                  {titulares.map((noticia, idx) => (
                    <li
                      key={noticia.id}
                      className={idx < titulares.length - 1 ? "border-b border-border/40" : ""}
                    >
                      <Link
                        href={`/noticias/${noticia.slug || noticia.id}`}
                        className="flex items-start gap-2.5 px-4 py-3 hover:bg-accent/40 group transition-colors duration-150"
                      >
                        <span className="text-[10px] font-black text-primary/60 mt-0.5 shrink-0 tabular-nums w-4">
                          {idx + 1}.
                        </span>
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-3">
                          {noticia.titulo}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
