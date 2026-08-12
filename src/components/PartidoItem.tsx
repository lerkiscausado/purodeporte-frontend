import { Partido } from "@/types";
import { Badge } from "./ui/badge";
import { EquipoAvatar } from "./EquipoAvatar";

interface PartidoItemProps {
  partido: Partido;
}

export function PartidoItem({ partido }: PartidoItemProps) {
  const isFinalizado = partido.estado === "Finalizado";
  const isEnJuego = partido.estado === "En Juego";
  const isCancelado = partido.estado === "Cancelado";

  const formattedDateTime = (() => {
    try {
      const d = new Date(partido.fecha);
      if (isNaN(d.getTime())) return partido.fecha;
      return `${d.toLocaleDateString(undefined, { day: "numeric", month: "short" })} · ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return partido.fecha;
    }
  })();

  return (
    <div className={`border-l-4 bg-card border border-border/60 rounded-sm p-3 transition-colors ${
      isEnJuego ? 'border-l-primary' : isFinalizado ? 'border-l-muted-foreground/40' : isCancelado ? 'border-l-destructive/60' : 'border-l-border'
    }`}>
      {/* Fecha + Estado */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground truncate" title={partido.escenario?.nombre ? `${formattedDateTime} · ${partido.escenario.nombre}` : formattedDateTime}>
          {formattedDateTime}
          {partido.escenario?.nombre && ` · ${partido.escenario.nombre}`}
        </span>
        {isEnJuego && <Badge variant="default" className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm animate-pulse shrink-0">VIVO</Badge>}
        {isFinalizado && <Badge variant="secondary" className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm shrink-0">Final</Badge>}
        {isCancelado && <Badge variant="destructive" className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm shrink-0">Cancelado</Badge>}
        {!isEnJuego && !isFinalizado && !isCancelado && <Badge variant="outline" className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm shrink-0">Pend.</Badge>}
      </div>

      {/* Equipos */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <EquipoAvatar
            nombre={partido.equipoLocal.nombre}
            foto={partido.equipoLocal.logoUrl || (partido.equipoLocal as any).foto}
            size="xs"
          />
          <span className="text-xs font-bold leading-tight truncate">{partido.equipoLocal.nombre}</span>
        </div>
        <div className="bg-secondary/80 px-2 py-0.5 rounded-sm font-black text-sm tabular-nums tracking-wider min-w-[50px] text-center shrink-0">
          {partido.marcadorLocal ?? "–"} : {partido.marcadorVisitante ?? "–"}
        </div>
        <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1 text-right">
          <span className="text-xs font-bold leading-tight truncate">{partido.equipoVisitante.nombre}</span>
          <EquipoAvatar
            nombre={partido.equipoVisitante.nombre}
            foto={partido.equipoVisitante.logoUrl || (partido.equipoVisitante as any).foto}
            size="xs"
          />
        </div>
      </div>
    </div>
  );
}

