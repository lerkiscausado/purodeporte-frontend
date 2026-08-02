"use client";

import { useState } from "react";
import { Partido } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FaCalendarAlt,
  FaSearch,
  FaThLarge,
  FaList,
  FaTrophy,
  FaMapMarkerAlt,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaRunning,
  FaClock,
} from "react-icons/fa";

interface ProgramacionPublicListClientProps {
  initialProgramacion: Partido[];
}

export function ProgramacionPublicListClient({ initialProgramacion }: ProgramacionPublicListClientProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [ramaFilter, setRamaFilter] = useState("all");

  const getSportIcon = (deporte?: string) => {
    if (!deporte) return <FaTrophy className="h-3.5 w-3.5 text-primary shrink-0" />;
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer") || dep.includes("futsal") || dep.includes("golito")) {
      return <FaFutbol className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return <FaBasketballBall className="h-3.5 w-3.5 text-orange-500 shrink-0" />;
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return <FaVolleyballBall className="h-3.5 w-3.5 text-indigo-500 shrink-0" />;
    }
    if (dep.includes("running") || dep.includes("atletismo")) {
      return <FaRunning className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
    }
    return <FaTrophy className="h-3.5 w-3.5 text-primary shrink-0" />;
  };

  // Formatear hora si existe en la fecha
  const formatTime = (fechaStr: string) => {
    try {
      const date = new Date(fechaStr);
      if (isNaN(date.getTime())) return "VS";
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      if (hours === "00" && minutes === "00") return "VS";
      return `${hours}:${minutes}`;
    } catch {
      return "VS";
    }
  };

  // Extraer deportes y ramas únicas existentes
  const sports = ["all", ...Array.from(new Set(initialProgramacion.map((p) => p.deporte).filter(Boolean)))];
  const ramas = ["all", ...Array.from(new Set(initialProgramacion.map((p) => p.categoria).filter(Boolean)))];

  // Filtrar programación
  const filteredProgramacion = initialProgramacion.filter((partido) => {
    const localName = partido.equipoLocal?.nombre || "";
    const visitanteName = partido.equipoVisitante?.nombre || "";
    const torneoName = partido.torneoNombre || "";
    const escenarioName = partido.escenario?.nombre || "";
    const deporteName = partido.deporte || "";
    const categoriaName = partido.categoria || "";
    const term = search.toLowerCase();

    const matchesSearch =
      localName.toLowerCase().includes(term) ||
      visitanteName.toLowerCase().includes(term) ||
      torneoName.toLowerCase().includes(term) ||
      escenarioName.toLowerCase().includes(term) ||
      deporteName.toLowerCase().includes(term) ||
      categoriaName.toLowerCase().includes(term);

    const matchesSport = sportFilter === "all" || partido.deporte === sportFilter;
    const matchesRama = ramaFilter === "all" || partido.categoria === ramaFilter;

    return matchesSearch && matchesSport && matchesRama;
  });

  return (
    <div className="space-y-6">
      {/* Controles de Búsqueda, Filtros y Selección de Vista */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card p-4 rounded-sm border border-border/60 shadow-sm">
        {/* Campo de Búsqueda y Selectores */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por equipo, torneo, deporte, rama o escenario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-muted/20 border-border/60"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-3.5 w-3.5" />
          </div>

          {sports.length > 1 && (
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="h-10 px-3 bg-card border border-border/60 rounded-sm text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider shrink-0"
            >
              <option value="all">Todos los deportes</option>
              {sports.filter((s) => s !== "all").map((sport) => (
                <option key={sport} value={sport}>
                  {String(sport).toUpperCase()}
                </option>
              ))}
            </select>
          )}

          {ramas.length > 1 && (
            <select
              value={ramaFilter}
              onChange={(e) => setRamaFilter(e.target.value)}
              className="h-10 px-3 bg-card border border-border/60 rounded-sm text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider shrink-0"
            >
              <option value="all">Todas las ramas</option>
              {ramas.filter((r) => r !== "all").map((rama) => (
                <option key={rama} value={rama}>
                  {String(rama).toUpperCase()}
                </option>
              ))}
            </select>
          )}
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
      {filteredProgramacion.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-card rounded-sm space-y-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary/10 text-primary">
            <FaCalendarAlt className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight">No hay partidos programados</h3>
            <p className="text-muted-foreground text-xs mt-1">
              Prueba cambiando los términos de búsqueda o filtros.
            </p>
          </div>
        </div>
      ) : viewMode === "cards" ? (
        /* VISTA DE TARJETAS (CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProgramacion.map((partido) => {
            const timeStr = formatTime(partido.fecha);

            return (
              <div
                key={partido.id}
                className="border border-border/60 bg-card rounded-sm shadow-md overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-200"
              >
                {/* Header: Fecha, Hora y Estado */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20 border-b border-border/40 text-[11px] font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FaCalendarAlt className="h-3 w-3 text-primary" />
                    <span>
                      {new Date(partido.fecha).toLocaleDateString("es-CO", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm border-primary/40 text-primary font-bold"
                  >
                    {partido.estado === "Pendiente" ? "Programado" : partido.estado}
                  </Badge>
                </div>

                {/* Body: Deporte, Rama, Torneo, Equipos */}
                <div className="p-4 space-y-3">
                  {/* Deporte, Rama y Torneo */}
                  {(partido.deporte || partido.categoria || partido.torneoNombre) && (
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/30 pb-2">
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        {getSportIcon(partido.deporte)}
                        {partido.deporte && <span className="font-extrabold text-foreground">{partido.deporte}</span>}
                        {partido.categoria && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-bold">{partido.categoria}</span>
                          </>
                        )}
                        {partido.torneoNombre && (
                          <>
                            <span>•</span>
                            <span className="truncate">{partido.torneoNombre}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-1">
                    {/* Equipo Local */}
                    <div className="flex-1 text-center space-y-1 min-w-0">
                      <p
                        className="text-sm font-black uppercase tracking-tight truncate leading-tight text-foreground"
                        title={partido.equipoLocal.nombre}
                      >
                        {partido.equipoLocal.nombre}
                      </p>
                    </div>

                    {/* Insignia Central (Hora o VS) */}
                    <div className="bg-secondary/80 border border-border/60 px-3.5 py-1.5 rounded-sm font-black text-sm text-primary tracking-wider shrink-0 text-center min-w-[70px] shadow-inner flex items-center justify-center gap-1">
                      {timeStr !== "VS" && <FaClock className="h-3 w-3 text-primary/70 shrink-0" />}
                      <span>{timeStr}</span>
                    </div>

                    {/* Equipo Visitante */}
                    <div className="flex-1 text-center space-y-1 min-w-0">
                      <p
                        className="text-sm font-black uppercase tracking-tight truncate leading-tight text-foreground"
                        title={partido.equipoVisitante.nombre}
                      >
                        {partido.equipoVisitante.nombre}
                      </p>
                    </div>
                  </div>

                  {/* Escenario si existe */}
                  {partido.escenario?.nombre && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/30">
                      <FaMapMarkerAlt className="h-3 w-3 text-sky-500 shrink-0" />
                      <span className="truncate font-semibold text-foreground" title={partido.escenario.nombre}>
                        {partido.escenario.nombre}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA DE TABLA (TABLE) */
        <div className="border border-border/60 rounded-sm shadow-md overflow-hidden bg-card animate-in fade-in-50 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/10">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deporte</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rama</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Torneo</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Equipo Local</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hora</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Equipo Visitante</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Escenario</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredProgramacion.map((partido, index) => {
                  const timeStr = formatTime(partido.fecha);

                  return (
                    <tr
                      key={partido.id}
                      className={cn(
                        "border-b border-border/40 hover:bg-muted/10 transition-colors",
                        index % 2 === 0 ? "" : "bg-muted/5"
                      )}
                    >
                      {/* Deporte */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                          {getSportIcon(partido.deporte)}
                          {partido.deporte || "Deporte"}
                        </span>
                      </td>

                      {/* Rama / Categoría */}
                      <td className="px-4 py-3 text-xs font-bold text-primary">
                        {partido.categoria || "—"}
                      </td>

                      {/* Torneo */}
                      <td className="px-4 py-3 text-xs font-bold text-foreground">
                        {partido.torneoNombre ? (
                          <div className="flex items-center gap-1.5" title={partido.torneoNombre}>
                            <FaTrophy className="h-3 w-3 text-amber-500 shrink-0" />
                            <span className="truncate max-w-[140px] uppercase">{partido.torneoNombre}</span>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/45">—</span>
                        )}
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <FaCalendarAlt className="h-3 w-3 text-muted-foreground/60" />
                          <span>
                            {new Date(partido.fecha).toLocaleDateString("es-CO", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Local */}
                      <td className="px-4 py-3 text-xs font-black uppercase tracking-tight text-right text-foreground">
                        {partido.equipoLocal.nombre}
                      </td>

                      {/* Hora / VS */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-xs tabular-nums tracking-wider text-primary bg-secondary/60 border border-border/40 px-2.5 py-0.5 rounded-sm inline-flex items-center gap-1 min-w-[50px] justify-center">
                          {timeStr !== "VS" && <FaClock className="h-2.5 w-2.5" />}
                          {timeStr}
                        </span>
                      </td>

                      {/* Visitante */}
                      <td className="px-4 py-3 text-xs font-black uppercase tracking-tight text-left text-foreground">
                        {partido.equipoVisitante.nombre}
                      </td>

                      {/* Escenario */}
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        {partido.escenario?.nombre ? (
                          <div className="flex items-center gap-1.5" title={partido.escenario.nombre}>
                            <FaMapMarkerAlt className="h-3 w-3 text-sky-500 shrink-0" />
                            <span className="truncate max-w-[150px] font-bold text-foreground">{partido.escenario.nombre}</span>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/45">—</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm border-primary/40 text-primary font-bold"
                        >
                          {partido.estado === "Pendiente" ? "Programado" : partido.estado}
                        </Badge>
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
