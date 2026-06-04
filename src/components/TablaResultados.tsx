import { Partido } from "@/types";
import { Badge } from "./ui/badge";

interface TablaResultadosProps {
  partidos: Partido[];
}

export function TablaResultados({ partidos }: TablaResultadosProps) {
  if (partidos.length === 0) {
    return (
      <div className="border border-border/60 rounded-sm bg-card p-6 text-center text-sm text-muted-foreground">
        No hay resultados para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {partidos.map((partido) => (
        <div key={partido.id} className="border-l-4 border-l-muted-foreground/30 bg-card border border-border/60 rounded-sm px-3 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">
              {new Date(partido.fecha).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </span>
            <Badge
              variant={partido.estado === "Finalizado" ? "secondary" : "default"}
              className="text-[8px] tracking-widest uppercase h-4 px-1.5 rounded-sm"
            >
              {partido.estado === "Finalizado" ? "Final" : partido.estado}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-bold flex-1 truncate ${
              partido.marcadorLocal != null && partido.marcadorVisitante != null && partido.marcadorLocal > partido.marcadorVisitante ? 'text-primary' : ''
            }`}>
              {partido.equipoLocal.nombre}
            </span>
            <span className="font-black text-sm tabular-nums tracking-wider text-primary min-w-[45px] text-center">
              {partido.marcadorLocal ?? "–"} : {partido.marcadorVisitante ?? "–"}
            </span>
            <span className={`text-xs font-bold flex-1 truncate text-right ${
              partido.marcadorLocal != null && partido.marcadorVisitante != null && partido.marcadorVisitante > partido.marcadorLocal ? 'text-primary' : ''
            }`}>
              {partido.equipoVisitante.nombre}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
