"use client";

import { useState } from "react";
import { Torneo } from "@/types";
import { CardTorneo } from "@/components/CardTorneo";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  FaTrophy,
  FaSearch,
  FaThLarge,
  FaList,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaRunning,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowRight,
} from "react-icons/fa";

interface TorneosPublicListClientProps {
  initialTorneos: Torneo[];
}

export function TorneosPublicListClient({ initialTorneos }: TorneosPublicListClientProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

  const getSportIcon = (deporte: string) => {
    if (!deporte) return <FaTrophy className="h-4 w-4 text-primary" />;
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer") || dep.includes("futsal") || dep.includes("golito")) {
      return <FaFutbol className="h-4 w-4 text-emerald-500" />;
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return <FaBasketballBall className="h-4 w-4 text-orange-500" />;
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return <FaVolleyballBall className="h-4 w-4 text-indigo-500" />;
    }
    if (dep.includes("running") || dep.includes("atletismo")) {
      return <FaRunning className="h-4 w-4 text-blue-500" />;
    }
    return <FaTrophy className="h-4 w-4 text-primary" />;
  };

  const getBadgeVariant = (estado: Torneo["estado"]) => {
    switch (estado) {
      case "En Juego": return "default";
      case "Inscripciones": return "secondary";
      case "Finalizado": return "outline";
      default: return "outline";
    }
  };

  // Obtener lista de deportes únicos
  const sports = ["all", ...Array.from(new Set(initialTorneos.map((t) => t.deporte)))];

  // Filtrar torneos por término de búsqueda y deporte seleccionado
  const filteredTorneos = initialTorneos.filter((torneo) => {
    const tournamentName = torneo.nombre || (torneo as any).name || "";
    const matchesSearch =
      tournamentName.toLowerCase().includes(search.toLowerCase()) ||
      torneo.deporte.toLowerCase().includes(search.toLowerCase()) ||
      torneo.categoria.toLowerCase().includes(search.toLowerCase()) ||
      (torneo.escenario?.nombre && torneo.escenario.nombre.toLowerCase().includes(search.toLowerCase()));

    const matchesSport = sportFilter === "all" || torneo.deporte === sportFilter;

    return matchesSearch && matchesSport;
  });

  return (
    <div className="space-y-6">
      {/* Controles de Búsqueda, Filtro y Selección de Vista */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card p-4 rounded-sm border border-border/60 shadow-sm">
        {/* Campo de búsqueda y selector de deporte */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar torneo, deporte o escenario..."
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
            <option value="all">Todos los deportes</option>
            {sports.filter((s) => s !== "all").map((sport) => (
              <option key={sport} value={sport}>
                {sport.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Toggles Vista Tarjetas / Tabla */}
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

      {/* Resultados de la Lista */}
      {filteredTorneos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-card rounded-sm space-y-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary/10 text-primary">
            <FaTrophy className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight">No se encontraron torneos</h3>
            <p className="text-muted-foreground text-xs mt-1">
              Prueba cambiando el término de búsqueda o seleccionando otro deporte.
            </p>
          </div>
        </div>
      ) : viewMode === "cards" ? (
        /* VISTA DE TARJETAS (CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTorneos.map((torneo) => (
            <CardTorneo key={torneo.id} torneo={torneo} />
          ))}
        </div>
      ) : (
        /* VISTA DE TABLA (TABLE) */
        <div className="border border-border/60 rounded-sm shadow-md overflow-hidden bg-card animate-in fade-in-50 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/10">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Torneo</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deporte</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Categoría</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha Inicio</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Escenario</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredTorneos.map((torneo, index) => {
                  const tournamentName = torneo.nombre || (torneo as any).name || "Torneo";
                  return (
                    <tr
                      key={torneo.id}
                      className={cn(
                        "border-b border-border/40 hover:bg-muted/10 transition-colors",
                        index % 2 === 0 ? "" : "bg-muted/5"
                      )}
                    >
                      {/* Nombre */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-sm bg-muted flex items-center justify-center shrink-0">
                            {getSportIcon(torneo.deporte)}
                          </div>
                          <span className="font-black text-sm uppercase tracking-tight text-foreground" title={tournamentName}>
                            {tournamentName}
                          </span>
                        </div>
                      </td>

                      {/* Deporte */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                          {getSportIcon(torneo.deporte)}
                          {torneo.deporte}
                        </span>
                      </td>

                      {/* Categoría */}
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        {torneo.categoria}
                      </td>

                      {/* Fecha Inicio */}
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <FaCalendarAlt className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                          <span>
                            {new Date(torneo.fechaInicio).toLocaleDateString("es-CO", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>

                      {/* Escenario */}
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        {torneo.escenario ? (
                          <div className="flex items-center gap-1.5" title={torneo.escenario.nombre}>
                            <FaMapMarkerAlt className="h-3 w-3 shrink-0 text-sky-500" />
                            <span className="font-bold text-foreground truncate max-w-[180px]">{torneo.escenario.nombre}</span>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/45">Sin escenario</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3">
                        <Badge variant={getBadgeVariant(torneo.estado)} className="uppercase tracking-wider text-[9px] font-bold px-1.5 py-0 h-4 rounded-sm">
                          {torneo.estado}
                        </Badge>
                      </td>

                      {/* Acción */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <Link href={`/torneos/${torneo.id}`}>
                            <Button size="sm" variant="ghost" className="font-bold text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1 h-7 px-2">
                              Ver detalles <FaArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
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
