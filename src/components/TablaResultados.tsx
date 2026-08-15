import { Partido } from "@/types";
import { Badge } from "./ui/badge";
import { EquipoAvatar } from "./EquipoAvatar";

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
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <EquipoAvatar
                nombre={partido.equipoLocal.nombre}
                foto={partido.equipoLocal.foto}
                size="xs"
              />
              <span className={`text-xs font-bold truncate ${
                partido.marcadorLocal != null && partido.marcadorVisitante != null && partido.marcadorLocal > partido.marcadorVisitante ? 'text-primary' : ''
              }`}>
                {partido.equipoLocal.nombre}
              </span>
            </div>
            <span className="font-black text-sm tabular-nums tracking-wider text-primary min-w-[45px] text-center shrink-0">
              {partido.marcadorLocal ?? "–"} : {partido.marcadorVisitante ?? "–"}
            </span>
            <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1 text-right">
              <span className={`text-xs font-bold truncate ${
                partido.marcadorLocal != null && partido.marcadorVisitante != null && partido.marcadorVisitante > partido.marcadorLocal ? 'text-primary' : ''
              }`}>
                {partido.equipoVisitante.nombre}
              </span>
              <EquipoAvatar
                nombre={partido.equipoVisitante.nombre}
                foto={partido.equipoVisitante.foto}
                size="xs"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
