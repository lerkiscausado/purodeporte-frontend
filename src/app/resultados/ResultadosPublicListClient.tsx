"use client";

import { useState, useEffect } from "react";
import { Partido } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EquipoAvatar } from "@/components/EquipoAvatar";
import { PartidoEstadisticasTable } from "@/components/PartidoEstadisticasTable";
import { PartidoPeriodosTable } from "@/components/PartidoPeriodosTable";
import { DatePickerStrip } from "@/components/DatePickerStrip";
import { getEstadisticasPorPartido } from "@/app/actions/estadisticas";
import { getPeriodosPublicosPorPartido } from "@/app/actions/partidoperiodos";
import {
  FaChartLine,
  FaChartBar,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaThLarge,
  FaList,
  FaCalendarAlt,
  FaTrophy,
  FaMapMarkerAlt,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaRunning,
} from "react-icons/fa";

interface ResultadosPublicListClientProps {
  initialResultados: Partido[];
}

function getSportIcon(deporte?: string) {
  if (!deporte) return <FaTrophy className="h-3.5 w-3.5 text-primary shrink-0" />;
  const dep = deporte.toLowerCase();
  if (
    dep.includes("futbol") ||
    dep.includes("fútbol") ||
    dep.includes("soccer") ||
    dep.includes("futsal") ||
    dep.includes("golito")
  ) {
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
}

/**
 * Componente individual de Tarjeta de Resultado con sección colapsable de Estadísticas y Períodos
 */
function ResultadoCardItem({ partido }: { partido: Partido }) {
  const isFinalizado = partido.estado === "Finalizado";
  const [stats, setStats] = useState<any[] | null>(null);
  const [periodos, setPeriodos] = useState<any[] | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isFinalizado && partido.id) {
      let isMounted = true;
      Promise.all([
        getEstadisticasPorPartido(Number(partido.id)),
        getPeriodosPublicosPorPartido(Number(partido.id)),
      ]).then(([statsRes, periodosRes]) => {
        if (isMounted) {
          setStats(Array.isArray(statsRes) ? statsRes : []);
          setPeriodos(Array.isArray(periodosRes) ? periodosRes : []);
        }
      });
      return () => {
        isMounted = false;
      };
    } else {
      setStats(null);
      setPeriodos(null);
    }
  }, [isFinalizado, partido.id]);

  const hasStats = Boolean(stats && stats.length > 0);
  const hasPeriodos = Boolean(periodos && periodos.length > 0);
  const hasDetails = hasStats || hasPeriodos;

  const localWins =
    partido.marcadorLocal != null &&
    partido.marcadorVisitante != null &&
    partido.marcadorLocal > partido.marcadorVisitante;

  const visitanteWins =
    partido.marcadorLocal != null &&
    partido.marcadorVisitante != null &&
    partido.marcadorVisitante > partido.marcadorLocal;

  return (
    <div className="border border-border/60 bg-card rounded-sm shadow-md overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-200">
      {/* Header: Fecha y Estado */}
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
          variant={isFinalizado ? "secondary" : "default"}
          className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm"
        >
          {isFinalizado ? "Final" : partido.estado}
        </Badge>
      </div>

      {/* Body: Deporte, Rama, Torneo, Marcador y Equipos */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Deporte, Rama y Torneo */}
          {(partido.deporte || partido.categoria || partido.torneoNombre) && (
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/30 pb-2">
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                {getSportIcon(partido.deporte)}
                {partido.deporte && (
                  <span className="font-extrabold text-foreground">{partido.deporte}</span>
                )}
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
            <div className="flex flex-col items-center flex-1 min-w-0">
              <EquipoAvatar
                nombre={partido.equipoLocal.nombre}
                foto={partido.equipoLocal.foto}
                size="lg"
                className="mb-1.5"
              />
              <p
                className={cn(
                  "text-sm font-black uppercase tracking-tight truncate leading-tight w-full text-center",
                  localWins ? "text-primary" : "text-foreground"
                )}
                title={partido.equipoLocal.nombre}
              >
                {partido.equipoLocal.nombre}
              </p>
              {localWins && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary mt-1">
                  <FaTrophy className="h-2.5 w-2.5" /> Ganador
                </span>
              )}
            </div>

            {/* Marcador Central */}
            <div className="bg-secondary/80 border border-border/60 px-3.5 py-1.5 rounded-sm font-black text-lg text-primary tabular-nums tracking-wider shrink-0 text-center min-w-[70px] shadow-inner">
              {partido.marcadorLocal ?? "–"} : {partido.marcadorVisitante ?? "–"}
            </div>

            {/* Equipo Visitante */}
            <div className="flex flex-col items-center flex-1 min-w-0">
              <EquipoAvatar
                nombre={partido.equipoVisitante.nombre}
                foto={partido.equipoVisitante.foto}
                size="lg"
                className="mb-1.5"
              />
              <p
                className={cn(
                  "text-sm font-black uppercase tracking-tight truncate leading-tight w-full text-center",
                  visitanteWins ? "text-primary" : "text-foreground"
                )}
                title={partido.equipoVisitante.nombre}
              >
                {partido.equipoVisitante.nombre}
              </p>
              {visitanteWins && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary mt-1">
                  <FaTrophy className="h-2.5 w-2.5" /> Ganador
                </span>
              )}
            </div>
          </div>

          {/* Escenario si existe */}
          {partido.escenario?.nombre && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/30">
              <FaMapMarkerAlt className="h-3 w-3 text-sky-500 shrink-0" />
              <span
                className="truncate font-semibold text-foreground"
                title={partido.escenario.nombre}
              >
                {partido.escenario.nombre}
              </span>
            </div>
          )}
        </div>

        {/* Sección Colapsable: Ver Estadísticas / Períodos (Solo si está finalizado y existen datos) */}
        {isFinalizado && hasDetails && (
          <div className="pt-2.5 border-t border-border/40 mt-2">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-between w-full text-[11px] font-bold text-primary hover:text-primary/80 transition-colors py-0.5 cursor-pointer"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <FaChartBar className="h-3 w-3" />
                {isOpen ? "Ocultar Estadísticas" : "Ver Estadísticas"}
              </span>
              {isOpen ? (
                <FaChevronUp className="h-2.5 w-2.5" />
              ) : (
                <FaChevronDown className="h-2.5 w-2.5" />
              )}
            </button>

            {isOpen && (
              <div className="mt-2 space-y-2.5 animate-in fade-in duration-150">
                {hasPeriodos && (
                  <PartidoPeriodosTable
                    periodos={periodos!}
                    equipoLocal={partido.equipoLocal}
                    equipoVisitante={partido.equipoVisitante}
                  />
                )}
                {hasStats && (
                  <PartidoEstadisticasTable
                    stats={stats!}
                    deporte={partido.deporte || "Futbol"}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Componente individual de Fila de Tabla con fila expandible de Estadísticas y Períodos
 */
function ResultadoTableRowItem({
  partido,
  index,
}: {
  partido: Partido;
  index: number;
}) {
  const isFinalizado = partido.estado === "Finalizado";
  const [stats, setStats] = useState<any[] | null>(null);
  const [periodos, setPeriodos] = useState<any[] | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isFinalizado && partido.id) {
      let isMounted = true;
      Promise.all([
        getEstadisticasPorPartido(Number(partido.id)),
        getPeriodosPublicosPorPartido(Number(partido.id)),
      ]).then(([statsRes, periodosRes]) => {
        if (isMounted) {
          setStats(Array.isArray(statsRes) ? statsRes : []);
          setPeriodos(Array.isArray(periodosRes) ? periodosRes : []);
        }
      });
      return () => {
        isMounted = false;
      };
    } else {
      setStats(null);
      setPeriodos(null);
    }
  }, [isFinalizado, partido.id]);

  const hasStats = Boolean(stats && stats.length > 0);
  const hasPeriodos = Boolean(periodos && periodos.length > 0);
  const hasDetails = hasStats || hasPeriodos;

  const localWins =
    partido.marcadorLocal != null &&
    partido.marcadorVisitante != null &&
    partido.marcadorLocal > partido.marcadorVisitante;

  const visitanteWins =
    partido.marcadorLocal != null &&
    partido.marcadorVisitante != null &&
    partido.marcadorVisitante > partido.marcadorLocal;

  return (
    <>
      <tr
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
        <td className="px-4 py-3">
          <div
            className={cn(
              "flex items-center justify-end gap-2 text-xs font-black uppercase tracking-tight",
              localWins ? "text-primary" : "text-foreground"
            )}
          >
            <span className="truncate">{partido.equipoLocal.nombre}</span>
            <EquipoAvatar
              nombre={partido.equipoLocal.nombre}
              foto={partido.equipoLocal.foto}
              size="sm"
            />
          </div>
        </td>

        {/* Marcador */}
        <td className="px-4 py-3 text-center">
          <span className="font-black text-sm tabular-nums tracking-wider text-primary bg-secondary/60 border border-border/40 px-2.5 py-0.5 rounded-sm inline-block min-w-[50px]">
            {partido.marcadorLocal ?? "–"} : {partido.marcadorVisitante ?? "–"}
          </span>
        </td>

        {/* Visitante */}
        <td className="px-4 py-3">
          <div
            className={cn(
              "flex items-center justify-start gap-2 text-xs font-black uppercase tracking-tight",
              visitanteWins ? "text-primary" : "text-foreground"
            )}
          >
            <EquipoAvatar
              nombre={partido.equipoVisitante.nombre}
              foto={partido.equipoVisitante.foto}
              size="sm"
            />
            <span className="truncate">{partido.equipoVisitante.nombre}</span>
          </div>
        </td>

        {/* Escenario */}
        <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
          {partido.escenario?.nombre ? (
            <div className="flex items-center gap-1.5" title={partido.escenario.nombre}>
              <FaMapMarkerAlt className="h-3 w-3 text-sky-500 shrink-0" />
              <span className="truncate max-w-[150px] font-bold text-foreground">
                {partido.escenario.nombre}
              </span>
            </div>
          ) : (
            <span className="italic text-muted-foreground/45">—</span>
          )}
        </td>

        {/* Estado y Toggle Estadísticas */}
        <td className="px-4 py-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <Badge
              variant={isFinalizado ? "secondary" : "default"}
              className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm"
            >
              {isFinalizado ? "Final" : partido.estado}
            </Badge>
            {isFinalizado && hasDetails && (
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider cursor-pointer"
                title={isOpen ? "Ocultar Estadísticas" : "Ver Estadísticas"}
              >
                <FaChartBar className="h-2.5 w-2.5" />
                {isOpen ? "Ocultar" : "Stats"}
              </button>
            )}
          </div>
        </td>
      </tr>
      {isFinalizado && hasDetails && isOpen && (
        <tr className="bg-muted/10 border-b border-border/40">
          <td colSpan={9} className="p-3">
            <div className="space-y-2.5 animate-in fade-in duration-150">
              {hasPeriodos && (
                <PartidoPeriodosTable
                  periodos={periodos!}
                  equipoLocal={partido.equipoLocal}
                  equipoVisitante={partido.equipoVisitante}
                />
              )}
              {hasStats && (
                <PartidoEstadisticasTable
                  stats={stats!}
                  deporte={partido.deporte || "Futbol"}
                />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function ResultadosPublicListClient({ initialResultados }: ResultadosPublicListClientProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [torneoFilter, setTorneoFilter] = useState("all");
  const [ramaFilter, setRamaFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Extraer deportes y ramas únicas existentes
  const sports = ["all", ...Array.from(new Set(initialResultados.map((p) => p.deporte).filter(Boolean)))];
  const ramas = ["all", ...Array.from(new Set(initialResultados.map((p) => p.categoria).filter(Boolean)))];

  // Derivar lista de torneos únicos presentes en initialResultados
  const torneosMap = new Map<string, string>();
  initialResultados.forEach((p) => {
    if (p.torneoId) {
      const idStr = String(p.torneoId);
      if (!torneosMap.has(idStr)) {
        torneosMap.set(idStr, p.torneoNombre || `Torneo #${idStr}`);
      }
    }
  });
  const torneos = Array.from(torneosMap.entries())
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Filtrar resultados
  const filteredResultados = initialResultados.filter((partido) => {
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
    const matchesTorneo = torneoFilter === "all" || String(partido.torneoId) === torneoFilter;
    const matchesRama = ramaFilter === "all" || partido.categoria === ramaFilter;
    const matchesDate = !selectedDate || isSameDay(new Date(partido.fecha), selectedDate);

    return matchesSearch && matchesSport && matchesTorneo && matchesRama && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Selector de fecha con DatePickerStrip */}
      <div className="space-y-2">
        <DatePickerStrip
          selectedDate={selectedDate ?? new Date()}
          onChange={setSelectedDate}
        />
        {selectedDate !== null && (
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-muted-foreground">
              Filtrando por fecha:{" "}
              <strong className="text-foreground">
                {selectedDate.toLocaleDateString("es-CO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="font-bold text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
            >
              Quitar filtro de fecha (Ver todos)
            </button>
          </div>
        )}
      </div>

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

          {torneos.length > 0 && (
            <select
              value={torneoFilter}
              onChange={(e) => setTorneoFilter(e.target.value)}
              className="h-10 px-3 bg-card border border-border/60 rounded-sm text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider shrink-0"
            >
              <option value="all">Todos los torneos</option>
              {torneos.map((torneo) => (
                <option key={torneo.id} value={torneo.id}>
                  {torneo.nombre.toUpperCase()}
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
      {filteredResultados.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-card rounded-sm space-y-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary/10 text-primary">
            <FaChartLine className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight">No se encontraron resultados</h3>
            <p className="text-muted-foreground text-xs mt-1">
              Prueba cambiando los términos de búsqueda o filtros.
            </p>
          </div>
        </div>
      ) : viewMode === "cards" ? (
        /* VISTA DE TARJETAS (CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResultados.map((partido) => (
            <ResultadoCardItem key={partido.id} partido={partido} />
          ))}
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
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resultado</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Equipo Visitante</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Escenario</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredResultados.map((partido, index) => (
                  <ResultadoTableRowItem
                    key={partido.id}
                    partido={partido}
                    index={index}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
