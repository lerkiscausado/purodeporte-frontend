"use client";

import { useState } from "react";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaRunning,
  FaTrophy,
  FaExternalLinkAlt,
  FaThLarge,
  FaList,
  FaSearch,
} from "react-icons/fa";
import { EditEscenarioModal } from "@/components/EditEscenarioModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EscenariosListClientProps {
  initialEscenarios: any[];
  isAdmin: boolean;
}

export function EscenariosListClient({ initialEscenarios, isAdmin }: EscenariosListClientProps) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

  // Mapear iconos pequeños por tipo de deporte
  const getSportIcon = (deporte: string) => {
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer") || dep.includes("futsal") || dep.includes("micro")) {
      return <FaFutbol className="h-4 w-4 text-emerald-500" />;
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return <FaBasketballBall className="h-4 w-4 text-orange-500" />;
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return <FaVolleyballBall className="h-4 w-4 text-indigo-500" />;
    }
    if (dep.includes("multiuso") || dep.includes("running")) {
      return <FaRunning className="h-4 w-4 text-blue-500" />;
    }
    return <FaTrophy className="h-4 w-4 text-primary" />;
  };

  // Obtener deportes únicos para los filtros
  const sports = ["all", ...Array.from(new Set(initialEscenarios.map((esc) => esc.deporte)))];

  // Mapear colores de badge según la disponibilidad
  const statusColors: Record<string, string> = {
    "Disponible": "bg-green-500/10 text-green-500 border-green-500/20",
    "No Disponible": "bg-red-500/10 text-red-500 border-red-500/20",
  };

  // Filtrar escenarios
  const filteredEscenarios = initialEscenarios.filter((escenario) => {
    const matchesSearch =
      escenario.nombre.toLowerCase().includes(search.toLowerCase()) ||
      escenario.direccion.toLowerCase().includes(search.toLowerCase()) ||
      (escenario.barrioSector && escenario.barrioSector.toLowerCase().includes(search.toLowerCase()));

    const matchesSport = sportFilter === "all" || escenario.deporte === sportFilter;

    return matchesSearch && matchesSport;
  });

  return (
    <div className="space-y-6">
      {/* Controles: Buscar, Filtrar y Toggles de Vista */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card p-4 rounded-sm border border-border/60 shadow-sm">
        {/* Búsqueda y Filtro */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por nombre, dirección o sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-muted/20 border-border/60"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-3.5 w-3.5 animate-in fade-in" />
          </div>

          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="h-10 px-3 bg-card border border-border/60 rounded-sm text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider text-xs shrink-0"
          >
            <option value="all">TODOS LOS DEPORTES</option>
            {sports.filter((s) => s !== "all").map((sport) => (
              <option key={sport} value={sport}>
                {sport.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Toggles de Vista */}
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

      {/* Resultados de la lista */}
      {filteredEscenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/10 rounded-sm space-y-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-sm bg-primary/10 text-primary">
            <FaMapMarkerAlt className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight">No se encontraron escenarios</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Prueba cambiando los términos de búsqueda o filtros.</p>
          </div>
          {isAdmin && (
            <Link href="/dashboard/escenarios/nuevo">
              <Button className="font-bold rounded-sm gap-2">
                <FaPlus className="h-4 w-4" />
                Registrar escenario
              </Button>
            </Link>
          )}
        </div>
      ) : viewMode === "cards" ? (
        /* VISTA DE TARJETAS (CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEscenarios.map((escenario) => (
            <div
              key={escenario.id}
              className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden flex flex-col bg-card hover:shadow-lg hover:border-r-border/80 transition-all duration-200 animate-in fade-in-50 duration-300"
            >
              {/* Contenido de la tarjeta */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Fila superior: Deporte + Estado */}
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getSportIcon(escenario.deporte)}
                      <span className="truncate">{escenario.deporte}</span>
                      <span>•</span>
                      <span>Instalación</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-wider ${statusColors[escenario.estado] || statusColors["Disponible"]}`}>
                      {escenario.estado}
                    </span>
                  </div>

                  {/* Nombre */}
                  <h3 className="text-base font-black tracking-tight uppercase line-clamp-2 leading-tight" title={escenario.nombre}>
                    {escenario.nombre}
                  </h3>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Dirección y ubicación */}
                  <div className="space-y-2 text-xs font-semibold text-muted-foreground">
                    {escenario.ubicacion ? (
                      <a
                        href={escenario.ubicacion.startsWith("http") ? escenario.ubicacion : `https://maps.google.com/?q=${encodeURIComponent(escenario.ubicacion)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/loc flex items-start gap-2.5 p-2 -mx-2 rounded-sm hover:bg-sky-500/5 border border-transparent hover:border-sky-500/10 transition-all duration-200"
                        title="Ver en Google Maps"
                      >
                        <FaMapMarkerAlt className="h-4 w-4 text-sky-500 shrink-0 mt-0.5 group-hover/loc:scale-110 group-hover/loc:animate-pulse transition-transform" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="line-clamp-1 text-foreground font-bold group-hover/loc:text-sky-500 group-hover/loc:underline transition-colors" title={escenario.direccion}>
                            {escenario.direccion}
                          </span>
                          {escenario.barrioSector && (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium mt-0.5">
                              Sector: {escenario.barrioSector}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-sky-500 uppercase tracking-widest mt-1">
                            Ver Mapa <FaExternalLinkAlt className="h-2 w-2 opacity-70 group-hover/loc:translate-x-0.5 group-hover/loc:-translate-y-0.5 transition-transform" />
                          </span>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-start gap-2.5 p-2 -mx-2">
                        <FaMapMarkerAlt className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
                        <div className="flex flex-col min-w-0">
                          <span className="line-clamp-1 text-foreground font-bold" title={escenario.direccion}>
                            {escenario.direccion}
                          </span>
                          {escenario.barrioSector && (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium mt-0.5">
                              Sector: {escenario.barrioSector}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                {isAdmin && (
                  <div className="pt-2 border-t border-border/50">
                    <EditEscenarioModal
                      escenarioId={escenario.id}
                      escenarioNombre={escenario.nombre}
                      escenarioDireccion={escenario.direccion}
                      escenarioDeporte={escenario.deporte}
                      escenarioEstado={escenario.estado}
                      escenarioBarrioSector={escenario.barrioSector}
                      escenarioUbicacion={escenario.ubicacion}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA DE TABLA (TABLE) */
        <div className="border border-border/60 rounded-sm shadow-md overflow-hidden bg-card animate-in fade-in-50 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/10">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Escenario</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deporte</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dirección</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Barrio / Sector</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                  {isAdmin && (
                    <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredEscenarios.map((escenario, index) => (
                  <tr
                    key={escenario.id}
                    className={cn(
                      "border-b border-border/40 hover:bg-muted/10 transition-colors",
                      index % 2 === 0 ? "" : "bg-muted/5"
                    )}
                  >
                    {/* Nombre */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-sm bg-muted flex items-center justify-center shrink-0">
                          {getSportIcon(escenario.deporte)}
                        </div>
                        <span className="font-black text-sm uppercase tracking-tight">{escenario.nombre}</span>
                      </div>
                    </td>

                    {/* Deporte */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                        {getSportIcon(escenario.deporte)}
                        {escenario.deporte}
                      </span>
                    </td>

                    {/* Dirección */}
                    <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                      {escenario.ubicacion ? (
                        <a
                          href={escenario.ubicacion.startsWith("http") ? escenario.ubicacion : `https://maps.google.com/?q=${encodeURIComponent(escenario.ubicacion)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sky-500 hover:text-sky-600 hover:underline font-bold uppercase text-[10px] tracking-wider"
                        >
                          {escenario.direccion}
                          <FaExternalLinkAlt className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span>{escenario.direccion}</span>
                      )}
                    </td>

                    {/* Sector */}
                    <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                      {escenario.barrioSector || <span className="text-muted-foreground/40">—</span>}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-wider ${statusColors[escenario.estado] || statusColors["Disponible"]}`}>
                        {escenario.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center max-w-[150px] mx-auto">
                          <EditEscenarioModal
                            escenarioId={escenario.id}
                            escenarioNombre={escenario.nombre}
                            escenarioDireccion={escenario.direccion}
                            escenarioDeporte={escenario.deporte}
                            escenarioEstado={escenario.estado}
                            escenarioBarrioSector={escenario.barrioSector}
                            escenarioUbicacion={escenario.ubicacion}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
