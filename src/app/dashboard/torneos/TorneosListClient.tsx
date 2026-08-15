"use client";

import { useState, useEffect } from "react";
import {
  FaTrophy,
  FaCalendarAlt,
  FaPlus,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaTableTennis,
  FaEdit,
  FaMapMarkerAlt,
  FaThLarge,
  FaList,
  FaSearch,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TorneosListClientProps {
  initialTorneos: any[];
}

const ITEMS_PER_PAGE = 12;

export function TorneosListClient({ initialTorneos }: TorneosListClientProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [ramaFilter, setRamaFilter] = useState("all");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset de página al cambiar cualquiera de los 4 filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sportFilter, ramaFilter, estadoFilter]);

  // Mapear iconos por deporte
  const getSportIcon = (deporte: string) => {
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
    if (dep.includes("tenis") || dep.includes("ping")) {
      return <FaTableTennis className="h-4 w-4 text-yellow-500" />;
    }
    return <FaTrophy className="h-4 w-4 text-primary" />;
  };

  // Mapear colores de badge según el estado
  const statusColors: Record<string, string> = {
    "Inscripciones": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "En Juego": "bg-green-500/10 text-green-500 border-green-500/20",
    "Finalizado": "bg-muted text-muted-foreground border-border/60",
    "Suspendido": "bg-red-500/10 text-red-500 border-red-500/20",
  };

  // Formatear periodo de fechas
  const formatPeriod = (startStr: string, endStr: string) => {
    if (!startStr) return "—";
    try {
      const startDate = new Date(startStr);
      const startDay = startDate.getDate();
      const startMonth = startDate.toLocaleDateString("es-CO", { month: "short" });

      if (!endStr) {
        return `Desde ${startDay} ${startMonth}, ${startDate.getFullYear()}`;
      }

      const endDate = new Date(endStr);
      const endDay = endDate.getDate();
      const endMonth = endDate.toLocaleDateString("es-CO", { month: "short" });

      return `${startDay} ${startMonth} — ${endDay} ${endMonth}, ${endDate.getFullYear()}`;
    } catch {
      return "—";
    }
  };

  // Obtener deportes únicos para los filtros
  const sports = ["all", ...Array.from(new Set(initialTorneos.map((t) => t.deporte)))];

  // Filtrar torneos
  const filteredTorneos = initialTorneos.filter((torneo) => {
    const matchesSearch =
      torneo.name.toLowerCase().includes(search.toLowerCase()) ||
      torneo.deporte.toLowerCase().includes(search.toLowerCase()) ||
      (torneo.escenario?.nombre && torneo.escenario.nombre.toLowerCase().includes(search.toLowerCase()));

    const matchesSport = sportFilter === "all" || torneo.deporte === sportFilter;
    const matchesRama = ramaFilter === "all" || torneo.rama === ramaFilter;
    const matchesEstado = estadoFilter === "all" || torneo.estado === estadoFilter;

    return matchesSearch && matchesSport && matchesRama && matchesEstado;
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredTorneos.length / ITEMS_PER_PAGE));
  const paginatedTorneos = filteredTorneos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Controles: Buscar, Filtrar (Deporte, Rama, Estado) y Toggles de Vista */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between bg-card p-4 rounded-sm border border-border/60 shadow-sm">
        {/* Búsqueda y Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Input
              placeholder="Buscar torneo, deporte o escenario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-muted/20 border-border/60 text-xs font-semibold"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-3.5 w-3.5 animate-in fade-in" />
          </div>

          {/* Filtro Deporte */}
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="h-10 px-3 bg-card border border-border/60 rounded-sm text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <option value="all">TODOS LOS DEPORTES</option>
            {sports.filter((s) => s !== "all").map((sport) => (
              <option key={sport} value={sport}>
                {sport.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Filtro Rama */}
          <select
            value={ramaFilter}
            onChange={(e) => setRamaFilter(e.target.value)}
            className="h-10 px-3 bg-card border border-border/60 rounded-sm text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <option value="all">TODAS LAS RAMAS</option>
            <option value="Masculino">MASCULINO</option>
            <option value="Femenino">FEMENINO</option>
            <option value="Mixto">MIXTO</option>
          </select>

          {/* Filtro Estado */}
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="h-10 px-3 bg-card border border-border/60 rounded-sm text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <option value="all">TODOS LOS ESTADOS</option>
            <option value="Inscripciones">INSCRIPCIONES</option>
            <option value="En Juego">EN JUEGO</option>
            <option value="Finalizado">FINALIZADO</option>
            <option value="Suspendido">SUSPENDIDO</option>
          </select>
        </div>

        {/* Toggles de Vista */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 border border-border/60 rounded-sm self-end xl:self-auto shrink-0">
          <button
            onClick={() => setViewMode("cards")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-sm transition-all duration-150 cursor-pointer",
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
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-sm transition-all duration-150 cursor-pointer",
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
      {filteredTorneos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/10 rounded-sm space-y-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-sm bg-primary/10 text-primary">
            <FaTrophy className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight">No se encontraron torneos</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Prueba cambiando los términos de búsqueda o filtros.</p>
          </div>
          <Link href="/dashboard/torneos/nuevo">
            <Button className="font-bold rounded-sm gap-2 uppercase tracking-wider text-xs cursor-pointer">
              <FaPlus className="h-4 w-4" />
              Crear torneo
            </Button>
          </Link>
        </div>
      ) : viewMode === "cards" ? (
        /* VISTA DE TARJETAS (CARDS) - PAGINADA */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTorneos.map((torneo) => (
              <div
                key={torneo.id}
                className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden flex flex-col bg-card hover:shadow-lg hover:border-r-border/80 transition-all duration-200 animate-in fade-in-50 duration-300"
              >
                {/* Contenido de la tarjeta */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Fila superior: Deporte + Rama + Estado */}
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {getSportIcon(torneo.deporte)}
                        <span className="truncate">{torneo.deporte}</span>
                        <span>•</span>
                        <span>{torneo.rama}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-wider ${statusColors[torneo.estado] || statusColors["Inscripciones"]}`}>
                        {torneo.estado}
                      </span>
                    </div>

                    {/* Nombre del torneo */}
                    <h3 className="text-base font-black tracking-tight uppercase line-clamp-2 leading-tight" title={torneo.name}>
                      {torneo.name}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Rango de Fechas */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <FaCalendarAlt className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                      <span>{formatPeriod(torneo.fechaInicio, torneo.fechaFin)}</span>
                    </div>

                    {/* Escenario Asignado */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <FaMapMarkerAlt className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                      <span className="truncate text-foreground font-bold" title={torneo.escenario?.nombre || "Sin escenario asignado"}>
                        {torneo.escenario ? (
                          torneo.escenario.nombre
                        ) : (
                          <span className="italic text-muted-foreground/60 font-medium">Sin escenario principal</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-2 border-t border-border/50">
                    <Link href={`/dashboard/torneos/gestionar-torneo?id=${torneo.id}`} className="w-full block">
                      <Button className="w-full font-bold rounded-sm h-10 bg-[oklch(0.25_0.05_255)] text-white hover:bg-[oklch(0.30_0.07_255)] border-none text-[11px] uppercase tracking-wider gap-1.5 justify-center cursor-pointer">
                        <FaEdit className="h-4 w-4" />
                        Gestionar Torneo
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VISTA DE TABLA (TABLE) - PAGINADA */
        <div className="space-y-6">
          <div className="border border-border/60 rounded-sm shadow-md overflow-hidden bg-card animate-in fade-in-50 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/10">
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Torneo</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deporte</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rama</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fechas</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Escenario</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                    <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTorneos.map((torneo, index) => (
                    <tr
                      key={torneo.id}
                      className={cn(
                        "border-b border-border/40 hover:bg-muted/10 transition-colors",
                        index % 2 === 0 ? "" : "bg-muted/5"
                      )}
                    >
                      {/* Torneo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-sm bg-muted flex items-center justify-center shrink-0">
                            {getSportIcon(torneo.deporte)}
                          </div>
                          <span className="font-black text-sm uppercase tracking-tight">{torneo.name}</span>
                        </div>
                      </td>

                      {/* Deporte */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                          {getSportIcon(torneo.deporte)}
                          {torneo.deporte}
                        </span>
                      </td>

                      {/* Rama */}
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        {torneo.rama}
                      </td>

                      {/* Fechas */}
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <FaCalendarAlt className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                          <span>{formatPeriod(torneo.fechaInicio, torneo.fechaFin)}</span>
                        </div>
                      </td>

                      {/* Escenario */}
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        {torneo.escenario ? (
                          <div className="flex items-center gap-1.5">
                            <FaMapMarkerAlt className="h-3 w-3 shrink-0 text-sky-500" />
                            <span className="font-bold text-foreground">{torneo.escenario.nombre}</span>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/45">Sin escenario</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-wider ${statusColors[torneo.estado] || statusColors["Inscripciones"]}`}>
                          {torneo.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center max-w-[150px] mx-auto">
                          <Link href={`/dashboard/torneos/gestionar-torneo?id=${torneo.id}`} className="w-full">
                            <Button className="w-full font-bold rounded-sm h-8 bg-[oklch(0.25_0.05_255)] text-white hover:bg-[oklch(0.30_0.07_255)] border-none text-[10px] uppercase tracking-wider gap-1 justify-center cursor-pointer">
                              <FaEdit className="h-3 w-3" />
                              Gestionar
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Controles de Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredTorneos.length}
        itemsPerPage={ITEMS_PER_PAGE}
        itemLabel="torneos"
      />
    </div>
  );
}
