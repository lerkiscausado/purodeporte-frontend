import { CardNoticia } from "@/components/CardNoticia";
import { CardTorneo } from "@/components/CardTorneo";
import { PartidoItem } from "@/components/PartidoItem";
import { TablaResultados } from "@/components/TablaResultados";
import { EquipoAvatar } from "@/components/EquipoAvatar";
import { getNoticias, getProgramacion, getResultados, getTorneos, getTorneosGrouped } from "@/services/api";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { DeportesAccordion } from "@/components/DeportesAccordion";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [noticias, torneos, programacion, resultados, deportesData] = await Promise.all([
    getNoticias(),
    getTorneos(),
    getProgramacion(),
    getResultados(),
    getTorneosGrouped()
  ]);

  // Encontrar partido en vivo o el próximo
  const partidoDestacado = programacion[0];

  return (
    <>
      {/* ═══ HERO — Marcador de Estadio ═══ */}
      <section className="relative w-full overflow-hidden bg-[hsl(218_50%_16%)] border-b-4 border-primary/60">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218_55%_12%)] via-[hsl(218_45%_18%)] to-[hsl(218_50%_14%)]" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="container mx-auto px-4 py-14 lg:py-20 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
            {/* Lado izquierdo — Mensaje */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/15 text-primary border border-primary/25 px-3 py-1 rounded-sm text-xs font-bold tracking-widest uppercase mb-5">
                ⚽ Tu Barrio, Tu Pasión
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-[1.1] text-white">
                Siente la Emoción del{" "}
                <span className="text-primary">Deporte Local</span>
              </h1>
              <p className="max-w-lg text-base text-white/60 font-medium mb-8 leading-relaxed">
                Torneos, estadísticas, resultados y programación de todas las ligas de tu sector.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/torneos" className={buttonVariants({ size: "lg", className: "font-bold tracking-wide rounded-sm shadow-lg shadow-primary/30 px-8" })}>
                  Explorar Torneos
                </Link>
                <Link href="/resultados" className={buttonVariants({ variant: "outline", size: "lg", className: "font-bold tracking-wide rounded-sm border-white/15 text-white hover:bg-white/10 hover:text-white px-8" })}>
                  Ver Resultados
                </Link>
              </div>
            </div>

            {/* Lado derecho — Próximo Partido (marcador) */}
            {partidoDestacado && (
              <div className="hidden lg:block bg-white/5 border border-white/10 rounded-sm p-5 min-w-[280px]">
                <div className="text-[10px] font-bold tracking-widest uppercase text-primary mb-3">Próximo Partido</div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <EquipoAvatar
                      nombre={partidoDestacado.equipoLocal.nombre}
                      foto={partidoDestacado.equipoLocal.foto}
                      size="md"
                      className="mb-1"
                    />
                    <span className="text-white font-bold text-xs text-center leading-tight truncate w-full" title={partidoDestacado.equipoLocal.nombre}>
                      {partidoDestacado.equipoLocal.nombre}
                    </span>
                  </div>

                  <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-sm font-black text-lg text-white/90 tabular-nums tracking-wider min-w-[70px] text-center shrink-0">
                    {partidoDestacado.marcadorLocal ?? "–"} : {partidoDestacado.marcadorVisitante ?? "–"}
                  </div>

                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <EquipoAvatar
                      nombre={partidoDestacado.equipoVisitante.nombre}
                      foto={partidoDestacado.equipoVisitante.foto}
                      size="md"
                      className="mb-1"
                    />
                    <span className="text-white font-bold text-xs text-center leading-tight truncate w-full" title={partidoDestacado.equipoVisitante.nombre}>
                      {partidoDestacado.equipoVisitante.nombre}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/40">
                  <span>{new Date(partidoDestacado.fecha).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span>{new Date(partidoDestacado.fecha).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ CONTENIDO — 3 Columnas 25-50-25 ═══ */}
      <div className="container mx-auto px-4 py-10 field-texture">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6 lg:gap-8">

          {/* ── COL 1: TORNEOS (25%) ─────────────────── */}
          <div className="space-y-6">
            <section className="pt-4 border-t border-border/40">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold marca-line">Deportes</h2>
                <Link href="/torneos" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-primary font-semibold text-xs h-7 px-2" })}>
                  Ver todos <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <DeportesAccordion deportesData={deportesData.deportes} />
            </section>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold marca-line">Popular</h2>
                <Link href="/torneos" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-primary font-semibold text-xs h-7 px-2" })}>
                  Ver todos <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              {torneos.length === 0 ? (
                <div className="border border-border/60 rounded-sm bg-card p-4 text-center text-xs text-muted-foreground font-medium">
                  No hay torneos disponibles.
                </div>
              ) : (
                <div className="space-y-3">
                  {torneos.slice(0, 6).map((torneo) => (
                    <CardTorneo key={torneo.id} torneo={torneo} />
                  ))}
                </div>
              )}
            </section>
            <section className="pt-4 border-t border-border/40">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold marca-line">Síguenos</h2>
              </div>
              <div className="bg-card border border-border/60 rounded-lg p-3 space-y-1 shadow-sm">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded hover:bg-[#1877F2]/5 text-foreground/80 hover:text-[#1877F2] transition-colors duration-150 group"
                >
                  <FaFacebook className="w-4 h-4 text-foreground/50 group-hover:text-[#1877F2] transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-wider">Facebook</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded hover:bg-[#E4405F]/5 text-foreground/80 hover:text-[#E4405F] transition-colors duration-150 group"
                >
                  <FaInstagram className="w-4 h-4 text-foreground/50 group-hover:text-[#E4405F] transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-wider">Instagram</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 hover:text-black dark:hover:text-white transition-colors duration-150 group"
                >
                  <FaTwitter className="w-4 h-4 text-foreground/50 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-wider">Twitter / X</span>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded hover:bg-[#FF0000]/5 text-foreground/80 hover:text-[#FF0000] transition-colors duration-150 group"
                >
                  <FaYoutube className="w-4 h-4 text-foreground/50 group-hover:text-[#FF0000] transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-wider">YouTube</span>
                </a>
              </div>
            </section>

          </div>

          {/* ── COL 2: NOTICIAS (50%) ────────────────── */}
          <section className="lg:border-x lg:border-border/60 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold marca-line">Noticias</h2>
            </div>
            {noticias.length === 0 ? (
              <div className="border border-border/60 rounded-sm bg-card p-6 text-center text-sm text-muted-foreground font-medium">
                No hay noticias recientes.
              </div>
            ) : (
              <div className="space-y-7">
                {noticias.map((noticia) => (
                  <CardNoticia key={noticia.id} noticia={noticia} />
                ))}
              </div>
            )}
          </section>

          {/* ── COL 3: PARTIDOS + RESULTADOS (25%) ───── */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold marca-line">Partidos</h2>
                <Link href="/programacion" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-primary font-semibold text-xs h-7 px-2" })}>
                  Todos <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              {programacion.length === 0 ? (
                <div className="border border-border/60 rounded-sm bg-card p-4 text-center text-xs text-muted-foreground font-medium">
                  No hay partidos programados.
                </div>
              ) : (
                <div className="space-y-3">
                  {programacion.slice(0, 4).map((partido) => (
                    <PartidoItem key={partido.id} partido={partido} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold marca-line">Resultados</h2>
                <Link href="/resultados" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-primary font-semibold text-xs h-7 px-2" })}>
                  Todos <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <TablaResultados partidos={resultados.slice(0, 5)} />
            </section>
          </div>

        </div>
      </div>
    </>
  );
}
