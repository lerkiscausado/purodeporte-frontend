import { Partido } from "@/types";
import { Badge } from "./ui/badge";

interface PartidoItemProps {
  partido: Partido;
}

export function PartidoItem({ partido }: PartidoItemProps) {
  const isFinalizado = partido.estado === "Finalizado";
  const isEnJuego = partido.estado === "En Juego";

  return (
    <div className={`border-l-4 bg-card border border-border/60 rounded-sm p-3 transition-colors ${
      isEnJuego ? 'border-l-primary' : isFinalizado ? 'border-l-muted-foreground/40' : 'border-l-border'
    }`}>
      {/* Fecha + Estado */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-muted-foreground">
          {new Date(partido.fecha).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          {" · "}
          {new Date(partido.fecha).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isEnJuego && <Badge variant="default" className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm animate-pulse">VIVO</Badge>}
        {isFinalizado && <Badge variant="secondary" className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm">Final</Badge>}
        {!isEnJuego && !isFinalizado && <Badge variant="outline" className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm">Pend.</Badge>}
      </div>

      {/* Equipos */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold leading-tight flex-1 truncate">{partido.equipoLocal.nombre}</span>
        <div className="bg-secondary/80 px-2 py-0.5 rounded-sm font-black text-sm tabular-nums tracking-wider min-w-[50px] text-center">
          {partido.marcadorLocal ?? "–"} : {partido.marcadorVisitante ?? "–"}
        </div>
        <span className="text-xs font-bold leading-tight flex-1 truncate text-right">{partido.equipoVisitante.nombre}</span>
      </div>
    </div>
  );
}
