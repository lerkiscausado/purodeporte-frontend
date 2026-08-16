"use client";

import { useState, useEffect } from "react";
import { EquipoAvatar } from "@/components/EquipoAvatar";
import { PartidoEstadisticasTable } from "@/components/PartidoEstadisticasTable";
import { getPlanillasPorTorneo } from "@/app/actions/planillas";
import { getEstadisticasPorPartido } from "@/app/actions/estadisticas";
import {
  FaTimes,
  FaUser,
  FaUsers,
  FaChartBar,
  FaSpinner,
  FaTrophy,
} from "react-icons/fa";

interface EquipoDetalleModalProps {
  open: boolean;
  onClose: () => void;
  equipo: {
    id: string | number;
    nombre: string;
    foto?: string | null;
    escudo?: string | null;
    representante?: string | null;
    deporte?: string;
  } | null;
  torneoId: number;
  torneoDeporte: string;
  partidosDelTorneo: any[];
}

export function EquipoDetalleModal({
  open,
  onClose,
  equipo,
  torneoId,
  torneoDeporte,
  partidosDelTorneo,
}: EquipoDetalleModalProps) {
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<any[]>([]);
  const [statsAcumuladas, setStatsAcumuladas] = useState<any[]>([]);
  const [partidosFinalizadosCount, setPartidosFinalizadosCount] = useState(0);

  useEffect(() => {
    if (!open || !equipo?.id) {
      setRoster([]);
      setStatsAcumuladas([]);
      setPartidosFinalizadosCount(0);
      return;
    }

    let isMounted = true;

    async function loadEquipoDetalle() {
      if (!equipo) return;
      setLoading(true);

      try {
        const equipoId = Number(equipo.id);

        // 1. Obtener planillas del torneo y filtrar por este equipo
        const planillasRes = await getPlanillasPorTorneo(Number(torneoId));
        let equipoRoster: any[] = [];
        if (planillasRes && planillasRes.success && Array.isArray(planillasRes.data)) {
          equipoRoster = planillasRes.data.filter(
            (p: any) => Number(p.equipo?.id || p.equipoId || p.idEquipo) === equipoId
          );
        }

        // 2. Filtrar partidos finalizados en los que participó este equipo
        const finalizadosEquipo = (partidosDelTorneo || []).filter((p: any) => {
          const isFinished = p.estado === "Finalizado";
          const isLocal = Number(p.equipoLocal?.id) === equipoId;
          const isVisitante = Number(p.equipoVisitante?.id) === equipoId;
          return isFinished && (isLocal || isVisitante);
        });

        // 3. Para cada partido finalizado, obtener estadísticas y acumular
        const matchStatsList = await Promise.all(
          finalizadosEquipo.map((partido: any) =>
            getEstadisticasPorPartido(Number(partido.id))
          )
        );

        // Agrupar y sumar estadísticas de los jugadores de este equipo
        const playerMap = new Map<
          number,
          {
            jugador: any;
            equipo: any;
            estadisticasMap: Map<
              string,
              {
                tipoEstadisticaId?: number;
                tipo: any;
                cantidad: number;
                puntos: number;
              }
            >;
            totalPuntos: number;
          }
        >();

        for (const matchStatArray of matchStatsList) {
          if (!Array.isArray(matchStatArray)) continue;
          for (const entry of matchStatArray) {
            const entryEquipoId = Number(entry.equipo?.id || entry.equipoId);
            if (entryEquipoId !== equipoId) continue;

            const jId = Number(entry.jugador?.id || entry.jugadorId);
            if (!jId) continue;

            if (!playerMap.has(jId)) {
              playerMap.set(jId, {
                jugador: entry.jugador,
                equipo: entry.equipo || { id: equipoId, nombre: equipo.nombre },
                estadisticasMap: new Map(),
                totalPuntos: 0,
              });
            }

            const playerData = playerMap.get(jId)!;
            playerData.totalPuntos += Number(entry.totalPuntos) || 0;

            for (const st of entry.estadisticas || []) {
              const tId = Number(
                st.tipoEstadisticaId ?? st.tipo?.id ?? st.id_tipo ?? st.tipoEstadistica?.id
              );
              const tipoKey = tId
                ? String(tId)
                : typeof st.tipo === "object"
                ? String(st.tipo?.nombre)
                : String(st.tipo || "stat");

              if (!playerData.estadisticasMap.has(tipoKey)) {
                playerData.estadisticasMap.set(tipoKey, {
                  tipoEstadisticaId: tId || undefined,
                  tipo: st.tipo || st.tipoEstadistica,
                  cantidad: 0,
                  puntos: 0,
                });
              }

              const existingSt = playerData.estadisticasMap.get(tipoKey)!;
              existingSt.cantidad += Number(st.cantidad) || 0;
              existingSt.puntos += Number(st.puntos) || 0;
            }
          }
        }

        const statsAcum = Array.from(playerMap.values()).map((p) => ({
          jugador: p.jugador,
          equipo: p.equipo,
          estadisticas: Array.from(p.estadisticasMap.values()),
          totalPuntos: p.totalPuntos,
        }));

        if (isMounted) {
          setRoster(equipoRoster);
          setStatsAcumuladas(statsAcum);
          setPartidosFinalizadosCount(finalizadosEquipo.length);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al cargar detalle del equipo:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEquipoDetalle();

    return () => {
      isMounted = false;
    };
  }, [open, equipo?.id, torneoId, partidosDelTorneo]);

  if (!open || !equipo) return null;

  const nombreEquipo = equipo.nombre || "Equipo";
  const fotoEquipo = equipo.foto || equipo.escudo || null;
  const representante = equipo.representante;

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card w-full max-w-2xl max-h-[90vh] border border-border/60 rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header del Modal */}
        <div className="flex items-start justify-between border-b border-border/60 p-5 bg-muted/20 gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <EquipoAvatar
              nombre={nombreEquipo}
              foto={fotoEquipo}
              size="lg"
              className="shrink-0 ring-2 ring-primary/20"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-foreground truncate" title={nombreEquipo}>
                  {nombreEquipo}
                </h2>
              </div>
              {representante ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium truncate">
                  <FaUser className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">Representante: <strong className="text-foreground">{representante}</strong></span>
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground/60 italic mt-0.5">
                  Sin representante registrado
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 transition-colors rounded-sm cursor-pointer hover:bg-muted/40 shrink-0"
            title="Cerrar ventana"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-xs font-semibold text-muted-foreground gap-3">
              <FaSpinner className="animate-spin h-6 w-6 text-primary" />
              <span>Cargando plantilla y estadísticas del equipo...</span>
            </div>
          ) : (
            <>
              {/* Sección 1: Roster de Jugadores */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FaUsers className="text-primary h-3.5 w-3.5" />
                    Roster de Jugadores ({roster.length})
                  </h3>
                </div>

                {roster.length === 0 ? (
                  <div className="p-6 text-center text-xs font-medium text-muted-foreground bg-muted/15 border border-border/40 rounded-sm">
                    No hay jugadores inscritos en la planilla de este equipo para este torneo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {roster.map((item, idx) => {
                      const jugador = item.jugador || {};
                      const jNombre =
                        `${jugador.nombres || jugador.nombre || ""} ${
                          jugador.apellidos || jugador.apellido || ""
                        }`.trim() || `Jugador #${jugador.id || idx + 1}`;
                      const numero = item.numeroCamiseta ? `#${item.numeroCamiseta}` : "-";

                      return (
                        <div
                          key={item.id || idx}
                          className="flex items-center gap-2.5 p-2.5 rounded-sm border border-border/40 bg-muted/10 hover:bg-muted/25 transition-colors"
                        >
                          <span className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/20 text-primary font-mono font-black text-xs flex items-center justify-center shrink-0">
                            {numero}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate uppercase" title={jNombre}>
                              {jNombre}
                            </p>
                            {jugador.identificacion && (
                              <p className="text-[10px] text-muted-foreground font-mono truncate">
                                Doc: {jugador.identificacion}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sección 2: Estadísticas Acumuladas del Torneo */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1.5 border-b border-border/40">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FaChartBar className="text-primary h-3.5 w-3.5" />
                    Estadísticas Acumuladas del Torneo
                  </h3>
                  {partidosFinalizadosCount > 0 && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm uppercase tracking-wider w-fit">
                      {partidosFinalizadosCount}{" "}
                      {partidosFinalizadosCount === 1 ? "partido finalizado" : "partidos finalizados"}
                    </span>
                  )}
                </div>

                {partidosFinalizadosCount === 0 ? (
                  <div className="p-6 text-center text-xs font-semibold text-muted-foreground bg-muted/15 border border-border/40 rounded-sm">
                    Este equipo aún no tiene partidos finalizados en este torneo.
                  </div>
                ) : statsAcumuladas.length === 0 ? (
                  <div className="p-6 text-center text-xs font-semibold text-muted-foreground bg-muted/15 border border-border/40 rounded-sm">
                    Aún no hay eventos ni estadísticas registradas para este equipo en los partidos finalizados.
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-150">
                    <PartidoEstadisticasTable
                      stats={statsAcumuladas}
                      deporte={torneoDeporte || equipo.deporte || "Futbol"}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="border-t border-border/60 p-4 bg-muted/15 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm border border-border/60 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
