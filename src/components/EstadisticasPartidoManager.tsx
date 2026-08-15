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
  FaUsers,
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

// Clave única para identificar una acción en progreso por jugador+tipo
// (en vez de stat.id, ya que ahora no hay un único id por agrupación)
type ActionKey = string; // `${jugadorId}-${tipoId}-minus` | `${jugadorId}-${tipoId}-delete`

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

  // ── Formulario de captura rápida ──
  const [selectedTeam, setSelectedTeam] = useState<"local" | "visitante">("local");
  const [selectedJugadorId, setSelectedJugadorId] = useState<string>("");
  const [selectedTipoId, setSelectedTipoId] = useState<string>("");
  const [applying, setApplying] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsSuccess, setStatsSuccess] = useState<string | null>(null);

  // ── Acciones en tabla: clave = `${jugadorId}-${tipoId}-minus|delete` ──
  const [actionInProgress, setActionInProgress] = useState<ActionKey | null>(null);

  const activePlanillas = selectedTeam === "local" ? localPlanillas : visitantePlanillas;
  const activeEquipoId = selectedTeam === "local" ? localEquipoId : visitanteEquipoId;

  // Reset jugador al cambiar equipo
  const handleTeamChange = (team: "local" | "visitante") => {
    setSelectedTeam(team);
    setSelectedJugadorId("");
    setStatsError(null);
    setStatsSuccess(null);
  };

  const refreshStats = async () => {
    const updated = await getEstadisticasPorPartido(Number(partido.id));
    onStatsUpdated(updated || []);
  };

  // ── Aplicar +1 (siempre cantidad=1, el backend crea una fila nueva) ──
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
        cantidad: 1, // siempre 1; el backend crea un evento nuevo
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
        // Limpiar solo el tipo (mantener jugador para anotación rápida)
        setSelectedTipoId("");
        await refreshStats();
        setTimeout(() => setStatsSuccess(null), 4000);
      }
    } catch {
      setStatsError("Error de conexión al registrar la estadística.");
    } finally {
      setApplying(false);
    }
  };

  // ── -1: elimina el último evento de ese tipo para ese jugador ──
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

  // ── 🗑 Eliminar TODO: llama a eliminarUltimo N veces en secuencia ──
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

  // ── Lógica tablas de resumen ──
  const buildTeamSummary = (equipoId: number) => {
    return matchStats
      .filter((s: any) => Number(s.equipo?.id) === equipoId)
      .map((s: any) => {
        const jId = Number(s.jugador?.id);
        return {
          jugadorId: jId,
          nombre:
            `${s.jugador?.nombre || s.jugador?.nombres || ""} ${s.jugador?.apellidos || ""}`.trim() ||
            `Jugador #${jId}`,
          estadisticas: s.estadisticas || [],
          totalPuntos: s.totalPuntos ?? 0,
        };
      })
      .filter((row) => row.estadisticas.length > 0);
  };

  const getActiveTiposForTeam = (rows: ReturnType<typeof buildTeamSummary>) => {
    const seen = new Map<number, string>();
    rows.forEach((row) => {
      row.estadisticas.forEach((st: any) => {
        const tipoId = Number(st.tipo?.id ?? st.tipoEstadisticaId ?? st.id_tipo);
        const tipoNombre =
          typeof st.tipo === "object"
            ? st.tipo?.nombre
            : st.tipo || st.nombre || "Estadística";
        if (!seen.has(tipoId)) seen.set(tipoId, tipoNombre);
      });
    });
    return Array.from(seen.entries()).map(([id, nombre]) => ({ id, nombre }));
  };

  const localRows = buildTeamSummary(localEquipoId);
  const visitanteRows = buildTeamSummary(visitanteEquipoId);
  const localTipos = getActiveTiposForTeam(localRows);
  const visitanteTipos = getActiveTiposForTeam(visitanteRows);

  const getStatForJugadorAndTipo = (
    rows: ReturnType<typeof buildTeamSummary>,
    jugadorId: number,
    tipoId: number
  ) => {
    const row = rows.find((r) => r.jugadorId === jugadorId);
    if (!row) return null;
    return (
      row.estadisticas.find(
        (st: any) => Number(st.tipo?.id ?? st.tipoEstadisticaId ?? st.id_tipo) === tipoId
      ) || null
    );
  };

  // ── Sub-componentes internos ──
  const TeamHeader = ({
    tipo,
    equipo,
    count,
  }: {
    tipo: "local" | "visitante";
    equipo: any;
    count: number;
  }) => (
    <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/60 rounded-sm mb-4">
      {equipo?.foto ? (
        <img
          src={getUploadUrl("equipos", equipo.foto)}
          alt={equipo.nombre}
          className="h-8 w-8 rounded-full object-cover border border-border/60 shadow-sm shrink-0"
        />
      ) : (
        <div
          className={cn(
            "h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-white bg-gradient-to-br shadow-sm uppercase",
            getGradientBg(equipo?.nombre || (tipo === "local" ? "L" : "V"))
          )}
        >
          {getInitials(equipo?.nombre || (tipo === "local" ? "Lo" : "Vi"))}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest block",
            tipo === "local" ? "text-sky-400" : "text-primary"
          )}
        >
          Equipo {tipo === "local" ? "Local" : "Visitante"}
        </span>
        <h4 className="text-xs font-black uppercase tracking-tight text-foreground truncate">
          {equipo?.nombre || (tipo === "local" ? "Local" : "Visitante")}
        </h4>
      </div>
      <span className="text-[10px] font-bold text-muted-foreground bg-card border border-border/60 px-2 py-0.5 rounded-sm">
        {count} {count === 1 ? "con estadísticas" : "con estadísticas"}
      </span>
    </div>
  );

  const TeamStatsTable = ({
    rows,
    tipos,
  }: {
    rows: ReturnType<typeof buildTeamSummary>;
    tipos: { id: number; nombre: string }[];
  }) => {
    if (rows.length === 0) {
      return (
        <div className="p-6 text-center text-xs text-muted-foreground italic border border-dashed border-border/60 rounded-sm bg-muted/5">
          Aún no hay estadísticas registradas para este equipo en este partido.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-sm border border-border/60">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/60 bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <th className="text-left px-3 py-2.5">Jugador</th>
              {tipos.map((t) => (
                <th key={t.id} className="text-center px-3 py-2.5 whitespace-nowrap">
                  {t.nombre}
                </th>
              ))}
              <th className="text-center px-3 py-2.5">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.jugadorId}
                className="border-b border-border/40 hover:bg-muted/10 transition-colors last:border-b-0"
              >
                {/* Jugador */}
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
                    <span className="font-bold uppercase text-foreground truncate max-w-[120px]">
                      {row.nombre}
                    </span>
                  </div>
                </td>

                {/* Celdas por tipo */}
                {tipos.map((t) => {
                  const stat = getStatForJugadorAndTipo(rows, row.jugadorId, t.id);
                  const minusKey: ActionKey = `${row.jugadorId}-${t.id}-minus`;
                  const deleteKey: ActionKey = `${row.jugadorId}-${t.id}-delete`;
                  const isMinusWorking = actionInProgress === minusKey;
                  const isDeleteWorking = actionInProgress === deleteKey;
                  const isWorking = isMinusWorking || isDeleteWorking;

                  return (
                    <td key={t.id} className="px-3 py-2.5 text-center">
                      {stat ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-black text-primary font-mono text-sm min-w-[1.5rem]">
                            {stat.cantidad}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            {/* Botón -1: llama al endpoint "eliminar último" */}
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() => handleMinus1(row.jugadorId, t.id)}
                              title="Deshacer último registro (+1→0 lo elimina)"
                              className="h-4 w-6 flex items-center justify-center rounded-[2px] bg-amber-500/15 text-amber-500 hover:bg-amber-500/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-[9px] font-black"
                            >
                              {isMinusWorking ? (
                                <FaSpinner className="h-2 w-2 animate-spin" />
                              ) : (
                                <FaMinus className="h-2 w-2" />
                              )}
                            </button>
                            {/* Botón 🗑: elimina todos los registros del tipo en loop */}
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() => handleDeleteAll(row.jugadorId, t.id, stat.cantidad)}
                              title={`Eliminar todos (${stat.cantidad}) los registros de este tipo`}
                              className="h-4 w-6 flex items-center justify-center rounded-[2px] bg-destructive/10 text-destructive hover:bg-destructive/25 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-[9px]"
                            >
                              {isDeleteWorking ? (
                                <FaSpinner className="h-2 w-2 animate-spin" />
                              ) : (
                                <FaTrash className="h-2 w-2" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 font-mono">—</span>
                      )}
                    </td>
                  );
                })}

                {/* Total Puntos */}
                <td className="px-3 py-2.5 text-center">
                  <span className="font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm text-[11px] font-mono">
                    {row.totalPuntos}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Loading state ──
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
              Planilla de anotador en vivo — cada clic registra un evento individual.
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
            {/* ── Alertas ── */}
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

            {/* ── Formulario de captura rápida ── */}
            <div className="border border-border/60 rounded-sm bg-muted/5 overflow-hidden">
              <div className="border-b border-border/40 bg-muted/20 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <FaPlus className="h-2.5 w-2.5 text-primary" />
                  Registrar Estadística (+1)
                </p>
              </div>

              <div className="p-4 space-y-4">
                {/* A. Equipo */}
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

                {/* B + C + D en fila */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  {/* B. Jugador */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <FaUser className="h-2.5 w-2.5" />
                      B. Jugador
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

                  {/* C. Estadística */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <FaChartBar className="h-2.5 w-2.5" />
                      C. Estadística
                    </p>
                    <select
                      value={selectedTipoId}
                      onChange={(e) => {
                        setSelectedTipoId(e.target.value);
                        setStatsError(null);
                      }}
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

                  {/* D. Botón +1 Aplicar */}
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

            {/* ── Tablas de resumen ── */}
            <div className="space-y-6">
              {/* Local */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <FaUsers className="h-3.5 w-3.5 text-sky-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Resumen — {partido.equipoLocal?.nombre || "Equipo Local"}
                  </h3>
                </div>
                <TeamHeader tipo="local" equipo={partido.equipoLocal} count={localRows.length} />
                <TeamStatsTable rows={localRows} tipos={localTipos} />
              </div>

              {/* Visitante */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <FaUsers className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Resumen — {partido.equipoVisitante?.nombre || "Equipo Visitante"}
                  </h3>
                </div>
                <TeamHeader
                  tipo="visitante"
                  equipo={partido.equipoVisitante}
                  count={visitanteRows.length}
                />
                <TeamStatsTable rows={visitanteRows} tipos={visitanteTipos} />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
