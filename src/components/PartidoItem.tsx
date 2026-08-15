"use client";

import { useState, useEffect } from "react";
import { Partido } from "@/types";
import { Badge } from "./ui/badge";
import { EquipoAvatar } from "./EquipoAvatar";
import { getEstadisticasPorPartido } from "@/app/actions/estadisticas";
import { FaChevronDown, FaChevronUp, FaChartBar } from "react-icons/fa";

interface PartidoItemProps {
  partido: Partido;
}

export function PartidoItem({ partido }: PartidoItemProps) {
  const isFinalizado = partido.estado === "Finalizado";
  const isEnJuego = partido.estado === "En Juego";
  const isCancelado = partido.estado === "Cancelado";
  const isSuspendido = partido.estado === "Suspendido";

  const [stats, setStats] = useState<any[] | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isFinalizado && partido.id) {
      let isMounted = true;
      getEstadisticasPorPartido(Number(partido.id)).then((res) => {
        if (isMounted) {
          setStats(Array.isArray(res) ? res : []);
        }
      });
      return () => {
        isMounted = false;
      };
    } else {
      setStats(null);
    }
  }, [isFinalizado, partido.id]);

  const formattedDateTime = (() => {
    try {
      const d = new Date(partido.fecha);
      if (isNaN(d.getTime())) return partido.fecha;
      return `${d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      })} · ${d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return partido.fecha;
    }
  })();

  const hasStats = Boolean(stats && stats.length > 0);

  return (
    <div
      className={`border-l-4 bg-card border border-border/60 rounded-sm p-3 transition-colors ${
        isEnJuego
          ? "border-l-primary"
          : isFinalizado
          ? "border-l-muted-foreground/40"
          : isCancelado
          ? "border-l-destructive/60"
          : isSuspendido
          ? "border-l-amber-500/60"
          : "border-l-border"
      }`}
    >
      {/* Fecha + Estado */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <span
          className="text-[11px] font-semibold text-muted-foreground truncate"
          title={
            partido.escenario?.nombre
              ? `${formattedDateTime} · ${partido.escenario.nombre}`
              : formattedDateTime
          }
        >
          {formattedDateTime}
          {partido.escenario?.nombre && ` · ${partido.escenario.nombre}`}
        </span>
        {isEnJuego && (
          <Badge
            variant="default"
            className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm animate-pulse shrink-0"
          >
            VIVO
          </Badge>
        )}
        {isFinalizado && (
          <Badge
            variant="secondary"
            className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm shrink-0"
          >
            Final
          </Badge>
        )}
        {isCancelado && (
          <Badge
            variant="destructive"
            className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm shrink-0"
          >
            Cancelado
          </Badge>
        )}
        {isSuspendido && (
          <Badge
            variant="outline"
            className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm shrink-0 border-amber-500/50 text-amber-500 font-bold"
          >
            Suspendido
          </Badge>
        )}
        {!isEnJuego && !isFinalizado && !isCancelado && !isSuspendido && (
          <Badge
            variant="outline"
            className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm shrink-0"
          >
            Pend.
          </Badge>
        )}
      </div>

      {/* Equipos */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <EquipoAvatar
            nombre={partido.equipoLocal.nombre}
            foto={partido.equipoLocal.foto}
            size="xs"
          />
          <span className="text-xs font-bold leading-tight truncate">
            {partido.equipoLocal.nombre}
          </span>
        </div>
        <div className="bg-secondary/80 px-2 py-0.5 rounded-sm font-black text-sm tabular-nums tracking-wider min-w-[50px] text-center shrink-0">
          {partido.marcadorLocal ?? "–"} : {partido.marcadorVisitante ?? "–"}
        </div>
        <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1 text-right">
          <span className="text-xs font-bold leading-tight truncate">
            {partido.equipoVisitante.nombre}
          </span>
          <EquipoAvatar
            nombre={partido.equipoVisitante.nombre}
            foto={partido.equipoVisitante.foto}
            size="xs"
          />
        </div>
      </div>

      {/* Sección Colapsable: Ver Estadísticas (Solo si está finalizado y existen estadísticas) */}
      {isFinalizado && hasStats && (
        <div className="mt-2.5 pt-2 border-t border-border/40">
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
            <div className="mt-2 overflow-x-auto rounded-sm border border-border/50 bg-muted/20 animate-in fade-in duration-150">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground border-b border-border/40 font-bold">
                  <tr>
                    <th className="py-1.5 px-2">Jugador</th>
                    <th className="py-1.5 px-2">Equipo</th>
                    <th className="py-1.5 px-2">Estadísticas</th>
                    <th className="py-1.5 px-2 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {stats!.map((item: any, idx: number) => {
                    const jugador = item.jugador || {};
                    const jNombre =
                      `${jugador.nombre || jugador.nombres || ""} ${
                        jugador.apellidos || jugador.apellido || ""
                      }`.trim() || `Jugador #${jugador.id || idx + 1}`;
                    const equipo = item.equipo || {};
                    const eqNombre = equipo.nombre || "Equipo";
                    const playerStats = item.estadisticas || [];
                    const totalPuntos = item.totalPuntos ?? "-";

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td
                          className="py-1.5 px-2 font-bold text-foreground truncate max-w-[120px]"
                          title={jNombre}
                        >
                          {jNombre}
                        </td>
                        <td
                          className="py-1.5 px-2 text-muted-foreground text-[10px] truncate max-w-[90px]"
                          title={eqNombre}
                        >
                          {eqNombre}
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="flex flex-wrap gap-1">
                            {playerStats.map((st: any, sIdx: number) => {
                              const sName =
                                typeof st.tipo === "object"
                                  ? st.tipo?.nombre
                                  : st.tipo ||
                                    st.tipoEstadistica?.nombre ||
                                    st.nombre ||
                                    "Stat";
                              return (
                                <span
                                  key={sIdx}
                                  className="bg-card border border-border/60 text-[9px] px-1.5 py-0.5 rounded-sm font-semibold text-foreground"
                                >
                                  {sName}:{" "}
                                  <strong className="text-primary font-mono">
                                    {st.cantidad}
                                  </strong>
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-right font-black font-mono text-primary text-[10px]">
                          {totalPuntos}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
