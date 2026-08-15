"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FaChartBar,
  FaCheck,
  FaPlus,
  FaTrash,
  FaMinus,
  FaSpinner,
  FaUser,
} from "react-icons/fa";
import {
  registrarEstadistica,
  eliminarUltimoRegistroEstadistica,
  getEstadisticasPorPartido,
} from "@/app/actions/estadisticas";
import { cn } from "@/lib/utils";
import { getUploadUrl } from "@/lib/uploads";

interface EstadisticasPartidoManagerProps {
  partido: any;
  torneo: any;
  tiposEstadistica: any[];
  planillas: any[];
  matchStats: any[];
  loadingStats: boolean;
  onStatsUpdated: (newStats: any[]) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getGradientBg(name: string): string {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "from-rose-500 to-orange-500",
    "from-violet-600 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-blue-600 to-cyan-500",
    "from-amber-500 to-yellow-500",
    "from-fuchsia-600 to-pink-600",
  ];
  return colors[hash % colors.length];
}

type ActionKey = string; // `${jugadorId}-${tipoId}-minus` | `${jugadorId}-${tipoId}-delete`

interface ColumnDefinition {
  key: string;
  label: string;
  tipoId?: number;
  isPoints?: boolean;
}

export function EstadisticasPartidoManager({
  partido,
  torneo,
  tiposEstadistica,
  planillas,
  matchStats,
  loadingStats,
  onStatsUpdated,
}: EstadisticasPartidoManagerProps) {
  const localEquipoId = Number(partido.equipoLocal?.id);
  const visitanteEquipoId = Number(partido.equipoVisitante?.id);

  const localPlanillas = planillas.filter(
    (p: any) => Number(p.equipo?.id || p.equipoId) === localEquipoId
  );
  const visitantePlanillas = planillas.filter(
    (p: any) => Number(p.equipo?.id || p.equipoId) === visitanteEquipoId
  );

  // ── 1. Formulario de captura rápida (Orden: Equipo -> Estadística -> Jugador -> Aplicar) ──
  const [selectedTeam, setSelectedTeam] = useState<"local" | "visitante">("local");
  const [selectedTipoId, setSelectedTipoId] = useState<string>("");
  const [selectedJugadorId, setSelectedJugadorId] = useState<string>("");
  const [applying, setApplying] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsSuccess, setStatsSuccess] = useState<string | null>(null);

  // ── Acciones en tabla ──
  const [actionInProgress, setActionInProgress] = useState<ActionKey | null>(null);

  const activePlanillas = selectedTeam === "local" ? localPlanillas : visitantePlanillas;
  const activeEquipoId = selectedTeam === "local" ? localEquipoId : visitanteEquipoId;

  // Al cambiar equipo: resetea jugador (y limpia mensajes)
  const handleTeamChange = (team: "local" | "visitante") => {
    setSelectedTeam(team);
    setSelectedJugadorId("");
    setStatsError(null);
    setStatsSuccess(null);
  };

  // Al cambiar estadística: resetea jugador
  const handleTipoChange = (tipoId: string) => {
    setSelectedTipoId(tipoId);
    setSelectedJugadorId("");
    setStatsError(null);
    setStatsSuccess(null);
  };

  const refreshStats = async () => {
    const updated = await getEstadisticasPorPartido(Number(partido.id));
    onStatsUpdated(updated || []);
  };

  // ── Aplicar (+1) ──
  const handleApplyPlus1 = async () => {
    const jugadorId = parseInt(selectedJugadorId, 10);
    const tipoId = parseInt(selectedTipoId, 10);
    if (!jugadorId || !tipoId) return;

    setApplying(true);
    setStatsError(null);
    setStatsSuccess(null);

    try {
      const res = await registrarEstadistica({
        jugadorId,
        partidoId: Number(partido.id),
        equipoId: activeEquipoId,
        tipoEstadisticaId: tipoId,
        cantidad: 1,
      });

      if (res.error) {
        setStatsError(res.error);
      } else {
        const planilla = activePlanillas.find(
          (p: any) => Number(p.jugador?.id || p.idJugador || p.jugadorId) === jugadorId
        );
        const jug = planilla?.jugador || {};
        const jNombre =
          `${jug.nombre || jug.nombres || ""} ${jug.apellidos || jug.apellido || ""}`.trim() ||
          `Jugador #${jugadorId}`;
        const tipoNombre =
          tiposEstadistica.find((t) => Number(t.id) === tipoId)?.nombre || "Estadística";

        setStatsSuccess(`+1 ${tipoNombre} registrado para ${jNombre}`);
        // Mantiene Equipo y Estadística; limpia SOLO Jugador para registrar rápido al siguiente
        setSelectedJugadorId("");
        await refreshStats();
        setTimeout(() => setStatsSuccess(null), 4000);
      }
    } catch {
      setStatsError("Error de conexión al registrar la estadística.");
    } finally {
      setApplying(false);
    }
  };

  // ── -1: Elimina último registro del tipo ──
  const handleMinus1 = async (jugadorId: number, tipoId: number) => {
    const key: ActionKey = `${jugadorId}-${tipoId}-minus`;
    setActionInProgress(key);
    setStatsError(null);

    try {
      const res = await eliminarUltimoRegistroEstadistica(
        jugadorId,
        Number(partido.id),
        tipoId
      );
      if (res.error) {
        setStatsError(res.error);
      } else {
        await refreshStats();
      }
    } catch {
      setStatsError("Error de conexión al deshacer.");
    } finally {
      setActionInProgress(null);
    }
  };

  // ── 🗑: Elimina todos los registros de ese tipo en secuencia ──
  const handleDeleteAll = async (jugadorId: number, tipoId: number, cantidad: number) => {
    const tipoNombre =
      tiposEstadistica.find((t) => Number(t.id) === tipoId)?.nombre || "esta estadística";
    if (
      !confirm(
        `¿Eliminar todos los ${cantidad} registro(s) de "${tipoNombre}" para este jugador?\nEsta acción no se puede deshacer.`
      )
    )
      return;

    const key: ActionKey = `${jugadorId}-${tipoId}-delete`;
    setActionInProgress(key);
    setStatsError(null);

    try {
      for (let i = 0; i < cantidad; i++) {
        const res = await eliminarUltimoRegistroEstadistica(
          jugadorId,
          Number(partido.id),
          tipoId
        );
        if (res.error) {
          setStatsError(`Error al eliminar (iteración ${i + 1}): ${res.error}`);
          break;
        }
      }
      await refreshStats();
    } catch {
      setStatsError("Error de conexión al eliminar.");
    } finally {
      setActionInProgress(null);
    }
  };

  // ── 2. Definición de Columnas según el Deporte ──
  const getColumnsForSport = (): ColumnDefinition[] => {
    const dep = (torneo.deporte || "").toLowerCase().trim();

    const findTipo = (predicate: (nombre: string) => boolean) => {
      return tiposEstadistica.find((t) => predicate((t.nombre || "").toLowerCase().trim()));
    };

    if (
      dep.includes("futbol") ||
      dep.includes("fútbol") ||
      dep.includes("soccer") ||
      dep.includes("microfutbol") ||
      dep.includes("microfútbol") ||
      dep.includes("golito")
    ) {
      // Fútbol / Microfutbol / Golito: # | Nombre | Goles | Faltas | Tarjeta Amarilla | Tarjeta Roja
      const golTipo = findTipo((n) => n === "gol" || n.includes("gol"));
      const faltaTipo = findTipo((n) => n.includes("falta"));
      const amarillaTipo = findTipo((n) => n.includes("amarill"));
      const rojaTipo = findTipo((n) => n.includes("roj"));

      return [
        { key: "goles", label: "Goles", tipoId: golTipo?.id ? Number(golTipo.id) : undefined },
        { key: "faltas", label: "Faltas", tipoId: faltaTipo?.id ? Number(faltaTipo.id) : undefined },
        { key: "amarillas", label: "Tarjeta Amarilla", tipoId: amarillaTipo?.id ? Number(amarillaTipo.id) : undefined },
        { key: "rojas", label: "Tarjeta Roja", tipoId: rojaTipo?.id ? Number(rojaTipo.id) : undefined },
      ];
    }

    if (dep.includes("baloncesto") || dep.includes("basket")) {
      // Baloncesto: # | Nombre | T2 | T3 | TL | Pts
      const t2Tipo = findTipo((n) => n.includes("campo") || n.includes("t2") || n.includes("doble") || n.includes("2 puntos"));
      const t3Tipo = findTipo((n) => n.includes("triple") || n.includes("t3") || n.includes("3 puntos"));
      const tlTipo = findTipo((n) => n.includes("libre") || n.includes("tl") || n.includes("1 punto"));

      return [
        { key: "t2", label: "T2", tipoId: t2Tipo?.id ? Number(t2Tipo.id) : undefined },
        { key: "t3", label: "T3", tipoId: t3Tipo?.id ? Number(t3Tipo.id) : undefined },
        { key: "tl", label: "TL", tipoId: tlTipo?.id ? Number(tlTipo.id) : undefined },
        { key: "pts", label: "Pts", isPoints: true },
      ];
    }

    if (dep.includes("voley") || dep.includes("voleibol") || dep.includes("volleyball")) {
      // Voleibol: # | Nombre | Remates | Saques | Bloqueos | Pts
      const remateTipo = findTipo((n) => n.includes("remate"));
      const saqueTipo = findTipo((n) => n.includes("saque") || n.includes("ace"));
      const bloqueoTipo = findTipo((n) => n.includes("bloqueo"));

      return [
        { key: "remates", label: "Remates", tipoId: remateTipo?.id ? Number(remateTipo.id) : undefined },
        { key: "saques", label: "Saques", tipoId: saqueTipo?.id ? Number(saqueTipo.id) : undefined },
        { key: "bloqueos", label: "Bloqueos", tipoId: bloqueoTipo?.id ? Number(bloqueoTipo.id) : undefined },
        { key: "pts", label: "Pts", isPoints: true },
      ];
    }

    // Fallback genérico para otros deportes
    const genericCols: ColumnDefinition[] = tiposEstadistica.map((t) => ({
      key: `stat-${t.id}`,
      label: t.nombre,
      tipoId: Number(t.id),
    }));
    genericCols.push({ key: "pts", label: "Pts", isPoints: true });
    return genericCols;
  };

  const columns = getColumnsForSport();

  // ── Cruce de datos por equipo ──
  const buildTeamRows = (equipoId: number) => {
    return matchStats
      .filter((s: any) => Number(s.equipo?.id) === equipoId)
      .map((s: any) => {
        const jId = Number(s.jugador?.id);
        const planilla = planillas.find(
          (p: any) =>
            Number(p.jugador?.id || p.idJugador || p.jugadorId) === jId &&
            Number(p.equipo?.id || p.equipoId) === equipoId
        );
        const numeroCamiseta = planilla?.numeroCamiseta ? `#${planilla.numeroCamiseta}` : "-";

        return {
          jugadorId: jId,
          numeroCamiseta,
          nombre:
            `${s.jugador?.nombre || s.jugador?.nombres || ""} ${s.jugador?.apellidos || ""}`.trim() ||
            `Jugador #${jId}`,
          estadisticas: s.estadisticas || [],
          totalPuntos: s.totalPuntos ?? 0,
        };
      })
      .filter((row) => row.estadisticas.length > 0);
  };

  const localRows = buildTeamRows(localEquipoId);
  const visitanteRows = buildTeamRows(visitanteEquipoId);

  const getStatEntry = (row: any, tipoId?: number) => {
    if (!tipoId) return null;
    return (
      row.estadisticas.find(
        (st: any) => Number(st.tipo?.id ?? st.tipoEstadisticaId ?? st.id_tipo) === tipoId
      ) || null
    );
  };

  if (loadingStats) {
    return (
      <Card className="border border-border/60 shadow-md">
        <CardContent className="p-12 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin h-4 w-4 text-primary" />
          Cargando planillas y estadísticas...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/60 shadow-md">
      <CardHeader className="border-b border-border/50 bg-muted/15 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <FaChartBar className="text-primary h-4.5 w-4.5" />
              Estadísticas por Jugador
            </CardTitle>
            <CardDescription className="text-xs">
              Planilla de anotador en vivo — selecciona equipo, estadística y jugador para registrar eventos.
            </CardDescription>
          </div>
          {tiposEstadistica.length > 0 && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-primary/10 text-primary border border-primary/20 w-fit">
              {tiposEstadistica.length}{" "}
              {tiposEstadistica.length === 1 ? "Tipo Disponible" : "Tipos Disponibles"}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {tiposEstadistica.length === 0 ? (
          <div className="p-8 text-center text-xs font-semibold text-muted-foreground bg-muted/20 border border-border/40 rounded-sm">
            No hay tipos de estadística configurados en el catálogo para el deporte &ldquo;
            {torneo.deporte}&rdquo;.
          </div>
        ) : (
          <>
            {/* ── Alertas de feedback ── */}
            {statsError && (
              <div className="p-3 bg-destructive/10 border border-destructive/25 text-destructive rounded-sm text-xs font-bold flex items-center justify-between">
                <span>{statsError}</span>
                <button
                  type="button"
                  onClick={() => setStatsError(null)}
                  className="text-destructive/70 hover:text-destructive text-sm ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
            {statsSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/25 text-green-500 rounded-sm text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FaCheck className="h-3.5 w-3.5" />
                  {statsSuccess}
                </span>
                <button
                  type="button"
                  onClick={() => setStatsSuccess(null)}
                  className="text-green-500/70 hover:text-green-500 text-sm ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ── Formulario de captura rápida en 4 pasos (Orden: Equipo -> Estadística -> Jugador -> Botón) ── */}
            <div className="border border-border/60 rounded-sm bg-muted/5 overflow-hidden">
              <div className="border-b border-border/40 bg-muted/20 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <FaPlus className="h-2.5 w-2.5 text-primary" />
                  Registrar Estadística (+1)
                </p>
              </div>

              <div className="p-4 space-y-4">
                {/* Paso A: Selector de Equipo */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    A. Equipo
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTeamChange("local")}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                        selectedTeam === "local"
                          ? "bg-sky-500/15 border-sky-500/60 text-sky-400 shadow-sm"
                          : "bg-card border-border/60 text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      {partido.equipoLocal?.foto ? (
                        <img
                          src={getUploadUrl("equipos", partido.equipoLocal.foto)}
                          alt={partido.equipoLocal.nombre}
                          className="h-5 w-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-black text-white bg-gradient-to-br",
                            getGradientBg(partido.equipoLocal?.nombre || "L")
                          )}
                        >
                          {getInitials(partido.equipoLocal?.nombre || "Lo")}
                        </div>
                      )}
                      <span className="truncate">{partido.equipoLocal?.nombre || "Local"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTeamChange("visitante")}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                        selectedTeam === "visitante"
                          ? "bg-primary/15 border-primary/60 text-primary shadow-sm"
                          : "bg-card border-border/60 text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      {partido.equipoVisitante?.foto ? (
                        <img
                          src={getUploadUrl("equipos", partido.equipoVisitante.foto)}
                          alt={partido.equipoVisitante.nombre}
                          className="h-5 w-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-black text-white bg-gradient-to-br",
                            getGradientBg(partido.equipoVisitante?.nombre || "V")
                          )}
                        >
                          {getInitials(partido.equipoVisitante?.nombre || "Vi")}
                        </div>
                      )}
                      <span className="truncate">
                        {partido.equipoVisitante?.nombre || "Visitante"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Pasos B + C + D: Estadística -> Jugador -> Aplicar (+1) */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  {/* Paso B: Estadística (ahora segundo) */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <FaChartBar className="h-2.5 w-2.5" />
                      B. Estadística
                    </p>
                    <select
                      value={selectedTipoId}
                      onChange={(e) => handleTipoChange(e.target.value)}
                      className="h-10 w-full bg-card border border-border/60 rounded-sm px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    >
                      <option value="">— Tipo de estadística —</option>
                      {tiposEstadistica.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                          {t.puntos ? ` (${t.puntos > 0 ? `+${t.puntos}` : t.puntos} pts)` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Paso C: Jugador (ahora tercero, filtrado por equipo activo) */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <FaUser className="h-2.5 w-2.5" />
                      C. Jugador
                    </p>
                    {activePlanillas.length === 0 ? (
                      <div className="h-10 flex items-center px-3 border border-dashed border-border/60 rounded-sm text-xs text-muted-foreground italic">
                        Sin planilla registrada
                      </div>
                    ) : (
                      <select
                        value={selectedJugadorId}
                        onChange={(e) => {
                          setSelectedJugadorId(e.target.value);
                          setStatsError(null);
                        }}
                        className="h-10 w-full bg-card border border-border/60 rounded-sm px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      >
                        <option value="">— Seleccionar jugador —</option>
                        {activePlanillas.map((p: any) => {
                          const jug = p.jugador || {};
                          const jId = Number(jug.id || p.idJugador || p.jugadorId);
                          const jNombre =
                            `${jug.nombre || jug.nombres || ""} ${jug.apellidos || jug.apellido || ""}`.trim() ||
                            `Jugador #${jId}`;
                          return (
                            <option key={jId} value={jId}>
                              {p.numeroCamiseta ? `#${p.numeroCamiseta} ` : ""}
                              {jNombre}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  {/* Paso D: Botón Aplicar (+1) */}
                  <Button
                    type="button"
                    disabled={applying || !selectedJugadorId || !selectedTipoId}
                    onClick={handleApplyPlus1}
                    className="h-10 px-5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {applying ? (
                      <FaSpinner className="h-3 w-3 animate-spin" />
                    ) : (
                      <FaPlus className="h-3 w-3" />
                    )}
                    {applying ? "..." : "+1 Aplicar"}
                  </Button>
                </div>
              </div>
            </div>

            {/* ── 3. Tabla ÚNICA de Resumen con columnas fijas según deporte ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FaChartBar className="text-primary h-3.5 w-3.5" />
                  Resumen Oficial de Estadísticas del Partido
                </h3>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Deporte: <strong className="text-foreground">{torneo.deporte}</strong>
                </span>
              </div>

              <div className="overflow-x-auto rounded-sm border border-border/60 bg-card">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/15 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <th className="text-center px-3 py-3 w-12">#</th>
                      <th className="text-left px-3 py-3 min-w-[140px]">Nombre</th>
                      {columns.map((col) => (
                        <th key={col.key} className="text-center px-3 py-3 whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* ── Subtítulo Equipo Local ── */}
                    <tr className="bg-sky-500/10 border-y border-sky-500/30">
                      <td colSpan={2 + columns.length} className="px-4 py-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {partido.equipoLocal?.foto ? (
                              <img
                                src={getUploadUrl("equipos", partido.equipoLocal.foto)}
                                alt={partido.equipoLocal.nombre}
                                className="h-5 w-5 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div
                                className={cn(
                                  "h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-black text-white bg-gradient-to-br",
                                  getGradientBg(partido.equipoLocal?.nombre || "L")
                                )}
                              >
                                {getInitials(partido.equipoLocal?.nombre || "Lo")}
                              </div>
                            )}
                            <span className="font-black uppercase tracking-wider text-sky-400 text-xs">
                              [ Local ] {partido.equipoLocal?.nombre || "Equipo Local"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-sky-400/80 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-sm">
                            {localRows.length} {localRows.length === 1 ? "jugador registrado" : "jugadores registrados"}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {localRows.length === 0 ? (
                      <tr className="border-b border-border/30">
                        <td
                          colSpan={2 + columns.length}
                          className="px-4 py-4 text-center text-xs text-muted-foreground italic bg-muted/5"
                        >
                          Aún no hay estadísticas registradas para el equipo local en este encuentro.
                        </td>
                      </tr>
                    ) : (
                      localRows.map((row) => (
                        <tr
                          key={row.jugadorId}
                          className="border-b border-border/40 hover:bg-muted/10 transition-colors"
                        >
                          {/* # Camiseta */}
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-primary text-xs">
                            {row.numeroCamiseta}
                          </td>

                          {/* Nombre Jugador */}
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={cn(
                                  "h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black text-white bg-gradient-to-br shadow-sm uppercase",
                                  getGradientBg(row.nombre)
                                )}
                              >
                                {getInitials(row.nombre)}
                              </div>
                              <span className="font-bold uppercase text-foreground truncate max-w-[160px]">
                                {row.nombre}
                              </span>
                            </div>
                          </td>

                          {/* Columnas dinámicas según el deporte */}
                          {columns.map((col) => {
                            if (col.isPoints) {
                              return (
                                <td key={col.key} className="px-3 py-2.5 text-center">
                                  <span className="font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm text-[11px] font-mono">
                                    {row.totalPuntos}
                                  </span>
                                </td>
                              );
                            }

                            const stat = getStatEntry(row, col.tipoId);
                            const hasValue = stat && stat.cantidad > 0;
                            const minusKey: ActionKey = `${row.jugadorId}-${col.tipoId}-minus`;
                            const deleteKey: ActionKey = `${row.jugadorId}-${col.tipoId}-delete`;
                            const isMinusWorking = actionInProgress === minusKey;
                            const isDeleteWorking = actionInProgress === deleteKey;
                            const isWorking = isMinusWorking || isDeleteWorking;

                            return (
                              <td key={col.key} className="px-3 py-2.5 text-center">
                                {hasValue && col.tipoId ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span className="font-black text-foreground font-mono text-sm min-w-[1.2rem]">
                                      {stat.cantidad}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {/* -1 */}
                                      <button
                                        type="button"
                                        disabled={isWorking}
                                        onClick={() => handleMinus1(row.jugadorId, col.tipoId!)}
                                        title="Deshacer 1 (-1)"
                                        className="h-5 w-5 flex items-center justify-center rounded-[2px] bg-amber-500/15 text-amber-500 hover:bg-amber-500/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isMinusWorking ? (
                                          <FaSpinner className="h-2.5 w-2.5 animate-spin" />
                                        ) : (
                                          <FaMinus className="h-2.5 w-2.5" />
                                        )}
                                      </button>
                                      {/* 🗑 Eliminar todo */}
                                      <button
                                        type="button"
                                        disabled={isWorking}
                                        onClick={() =>
                                          handleDeleteAll(row.jugadorId, col.tipoId!, stat.cantidad)
                                        }
                                        title={`Eliminar todo (${stat.cantidad})`}
                                        className="h-5 w-5 flex items-center justify-center rounded-[2px] bg-destructive/10 text-destructive hover:bg-destructive/25 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isDeleteWorking ? (
                                          <FaSpinner className="h-2.5 w-2.5 animate-spin" />
                                        ) : (
                                          <FaTrash className="h-2.5 w-2.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/40 font-mono">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}

                    {/* ── Subtítulo Equipo Visitante ── */}
                    <tr className="bg-primary/10 border-y border-primary/30">
                      <td colSpan={2 + columns.length} className="px-4 py-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {partido.equipoVisitante?.foto ? (
                              <img
                                src={getUploadUrl("equipos", partido.equipoVisitante.foto)}
                                alt={partido.equipoVisitante.nombre}
                                className="h-5 w-5 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div
                                className={cn(
                                  "h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-black text-white bg-gradient-to-br",
                                  getGradientBg(partido.equipoVisitante?.nombre || "V")
                                )}
                              >
                                {getInitials(partido.equipoVisitante?.nombre || "Vi")}
                              </div>
                            )}
                            <span className="font-black uppercase tracking-wider text-primary text-xs">
                              [ Visitante ] {partido.equipoVisitante?.nombre || "Equipo Visitante"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm">
                            {visitanteRows.length} {visitanteRows.length === 1 ? "jugador registrado" : "jugadores registrados"}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {visitanteRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={2 + columns.length}
                          className="px-4 py-4 text-center text-xs text-muted-foreground italic bg-muted/5"
                        >
                          Aún no hay estadísticas registradas para el equipo visitante en este encuentro.
                        </td>
                      </tr>
                    ) : (
                      visitanteRows.map((row) => (
                        <tr
                          key={row.jugadorId}
                          className="border-b border-border/40 hover:bg-muted/10 transition-colors last:border-b-0"
                        >
                          {/* # Camiseta */}
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-primary text-xs">
                            {row.numeroCamiseta}
                          </td>

                          {/* Nombre Jugador */}
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={cn(
                                  "h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black text-white bg-gradient-to-br shadow-sm uppercase",
                                  getGradientBg(row.nombre)
                                )}
                              >
                                {getInitials(row.nombre)}
                              </div>
                              <span className="font-bold uppercase text-foreground truncate max-w-[160px]">
                                {row.nombre}
                              </span>
                            </div>
                          </td>

                          {/* Columnas dinámicas según el deporte */}
                          {columns.map((col) => {
                            if (col.isPoints) {
                              return (
                                <td key={col.key} className="px-3 py-2.5 text-center">
                                  <span className="font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm text-[11px] font-mono">
                                    {row.totalPuntos}
                                  </span>
                                </td>
                              );
                            }

                            const stat = getStatEntry(row, col.tipoId);
                            const hasValue = stat && stat.cantidad > 0;
                            const minusKey: ActionKey = `${row.jugadorId}-${col.tipoId}-minus`;
                            const deleteKey: ActionKey = `${row.jugadorId}-${col.tipoId}-delete`;
                            const isMinusWorking = actionInProgress === minusKey;
                            const isDeleteWorking = actionInProgress === deleteKey;
                            const isWorking = isMinusWorking || isDeleteWorking;

                            return (
                              <td key={col.key} className="px-3 py-2.5 text-center">
                                {hasValue && col.tipoId ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span className="font-black text-foreground font-mono text-sm min-w-[1.2rem]">
                                      {stat.cantidad}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {/* -1 */}
                                      <button
                                        type="button"
                                        disabled={isWorking}
                                        onClick={() => handleMinus1(row.jugadorId, col.tipoId!)}
                                        title="Deshacer 1 (-1)"
                                        className="h-5 w-5 flex items-center justify-center rounded-[2px] bg-amber-500/15 text-amber-500 hover:bg-amber-500/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isMinusWorking ? (
                                          <FaSpinner className="h-2.5 w-2.5 animate-spin" />
                                        ) : (
                                          <FaMinus className="h-2.5 w-2.5" />
                                        )}
                                      </button>
                                      {/* 🗑 Eliminar todo */}
                                      <button
                                        type="button"
                                        disabled={isWorking}
                                        onClick={() =>
                                          handleDeleteAll(row.jugadorId, col.tipoId!, stat.cantidad)
                                        }
                                        title={`Eliminar todo (${stat.cantidad})`}
                                        className="h-5 w-5 flex items-center justify-center rounded-[2px] bg-destructive/10 text-destructive hover:bg-destructive/25 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isDeleteWorking ? (
                                          <FaSpinner className="h-2.5 w-2.5 animate-spin" />
                                        ) : (
                                          <FaTrash className="h-2.5 w-2.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/40 font-mono">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
