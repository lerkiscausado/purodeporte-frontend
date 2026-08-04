"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaNewspaper,
  FaPlus,
  FaSearch,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaCalendarAlt,
  FaThLarge,
  FaList,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getUploadUrl } from "@/lib/uploads";
import { EditNoticiaModal } from "@/components/EditNoticiaModal";
import { DeleteNoticiaButton } from "@/components/DeleteNoticiaButton";

interface NoticiasListClientProps {
  initialNoticias: any[];
}

export function NoticiasListClient({ initialNoticias }: NoticiasListClientProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

  const getSportIcon = (deporte: string) => {
    if (!deporte) return <FaNewspaper className="h-4 w-4 text-primary" />;
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer")) {
      return <FaFutbol className="h-4 w-4 text-emerald-500" />;
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return <FaBasketballBall className="h-4 w-4 text-orange-500" />;
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return <FaVolleyballBall className="h-4 w-4 text-indigo-500" />;
    }
    return <FaNewspaper className="h-4 w-4 text-primary" />;
  };

  const sports = ["all", ...Array.from(new Set(initialNoticias.map((n) => n.deporte).filter(Boolean)))];

  const filteredNoticias = initialNoticias.filter((noticia) => {
    const matchesSearch =
      (noticia.titulo || "").toLowerCase().includes(search.toLowerCase()) ||
      (noticia.subtitulo || "").toLowerCase().includes(search.toLowerCase()) ||
      (noticia.descripcion || "").toLowerCase().includes(search.toLowerCase());

    const matchesSport = sportFilter === "all" || noticia.deporte === sportFilter;

    return matchesSearch && matchesSport;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FaNewspaper className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
              Gestión de Noticias
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Publica y administra las noticias deportivas de la plataforma.
            </p>
          </div>
        </div>

        <Link href="/dashboard/noticias/nuevo">
          <Button className="font-bold h-11 px-5 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none w-full sm:w-auto uppercase tracking-wider text-xs">
            <FaPlus className="mr-2 h-3.5 w-3.5" /> Nueva Noticia
          </Button>
        </Link>
      </div>

      {/* Controles de Búsqueda, Filtro y Selección de Vista */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card p-4 rounded-sm border border-border/60 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por título, subtítulo o contenido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-muted/20 border-border/60"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-3.5 w-3.5" />
          </div>

          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="h-10 px-3 bg-card border border-border/60 rounded-sm text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider shrink-0"
          >
            <option value="all">TODOS LOS DEPORTES</option>
            {sports.filter((s) => s !== "all").map((sport) => (
              <option key={sport} value={sport}>
                {sport.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Alternar Vista (Cards / Tabla) */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 border border-border/60 rounded-sm self-end md:self-auto shrink-0">
          <button
            onClick={() => setViewMode("cards")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-sm transition-all duration-150",
              viewMode === "cards"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Vista de Tarjetas"
          >
            <FaThLarge className="h-3.5 w-3.5" />
            <span>Tarjetas</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-sm transition-all duration-150",
              viewMode === "table"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Vista de Tabla"
          >
            <FaList className="h-3.5 w-3.5" />
            <span>Tabla</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      {filteredNoticias.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-sm p-12 text-center text-muted-foreground text-sm font-medium">
          No se encontraron noticias con los criterios seleccionados.
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNoticias.map((noticia) => {
            const fotoUrl = getUploadUrl("noticias", noticia.foto || noticia.imagenUrl);

            return (
              <div
                key={noticia.id}
                className="bg-card border border-border/60 rounded-sm overflow-hidden shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Foto de Portada */}
                  <div className="relative h-44 w-full bg-muted overflow-hidden border-b border-border/40">
                    <img
                      src={fotoUrl}
                      alt={noticia.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="uppercase text-[9px] font-black px-2 py-0.5 shadow">
                        {noticia.deporte}
                      </Badge>
                    </div>
                  </div>

                  {/* Detalle */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold">
                      <FaCalendarAlt className="h-3 w-3 text-primary/70" />
                      <span>{formatDate(noticia.createdAt || noticia.fecha)}</span>
                    </div>

                    <h3 className="font-black text-base text-foreground uppercase tracking-tight line-clamp-2 leading-snug" title={noticia.titulo}>
                      {noticia.titulo}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 font-medium">
                      {noticia.subtitulo}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-3 border-t border-border/40 bg-muted/15 flex items-center justify-between">
                  <Link
                    href={`/noticias/${noticia.id}`}
                    target="_blank"
                    className="text-[11px] font-bold text-primary hover:underline uppercase"
                  >
                    Ver pública →
                  </Link>

                  <div className="flex items-center gap-1">
                    <EditNoticiaModal noticia={noticia} />
                    <DeleteNoticiaButton noticiaId={noticia.id} noticiaTitulo={noticia.titulo} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 uppercase tracking-wider text-[10px] font-bold text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Noticia</th>
                  <th className="py-3 px-3">Deporte</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {filteredNoticias.map((noticia) => {
                  const fotoUrl = getUploadUrl("noticias", noticia.foto || noticia.imagenUrl);

                  return (
                    <tr key={noticia.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={fotoUrl}
                            alt={noticia.titulo}
                            className="h-10 w-14 object-cover rounded-sm border border-border/60 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-xs uppercase truncate max-w-md" title={noticia.titulo}>
                              {noticia.titulo}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-md">
                              {noticia.subtitulo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase">
                          {noticia.deporte}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(noticia.createdAt || noticia.fecha)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditNoticiaModal noticia={noticia} />
                          <DeleteNoticiaButton noticiaId={noticia.id} noticiaTitulo={noticia.titulo} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
