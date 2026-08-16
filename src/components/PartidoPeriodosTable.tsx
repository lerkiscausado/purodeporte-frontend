import { cn } from "@/lib/utils";

interface PartidoPeriodosTableProps {
  periodos: Array<{
    id?: number | string;
    nombrePeriodo: string;
    tipoPeriodo?: string;
    scoreLocal: number;
    scoreVisitante: number;
  }>;
  equipoLocal: {
    nombre: string;
    foto?: string | null;
  };
  equipoVisitante: {
    nombre: string;
    foto?: string | null;
  };
  className?: string;
}

export function PartidoPeriodosTable({
  periodos,
  equipoLocal,
  equipoVisitante,
  className,
}: PartidoPeriodosTableProps) {
  if (!periodos || periodos.length === 0) return null;

  const totalLocal = periodos.reduce(
    (sum, p) => sum + (Number(p.scoreLocal) || 0),
    0
  );
  const totalVisitante = periodos.reduce(
    (sum, p) => sum + (Number(p.scoreVisitante) || 0),
    0
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <span>Resultado por Períodos</span>
      </div>
      <div className="overflow-x-auto rounded-sm border border-border/50 bg-muted/20">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground border-b border-border/40 font-bold">
            <tr>
              <th className="py-1.5 px-2">Equipo</th>
              {periodos.map((p, idx) => (
                <th
                  key={p.id ?? idx}
                  className="py-1.5 px-2 text-center whitespace-nowrap"
                >
                  {p.nombrePeriodo || `P${idx + 1}`}
                </th>
              ))}
              <th className="py-1.5 px-2 text-right font-black text-primary">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            <tr className="hover:bg-muted/40 transition-colors">
              <td
                className="py-1.5 px-2 font-bold text-foreground truncate max-w-[120px]"
                title={equipoLocal.nombre}
              >
                {equipoLocal.nombre}
              </td>
              {periodos.map((p, idx) => (
                <td
                  key={p.id ?? idx}
                  className="py-1.5 px-2 text-center font-mono font-bold text-foreground text-[10px]"
                >
                  {p.scoreLocal ?? 0}
                </td>
              ))}
              <td className="py-1.5 px-2 text-right font-black font-mono text-primary text-[10px]">
                {totalLocal}
              </td>
            </tr>
            <tr className="hover:bg-muted/40 transition-colors">
              <td
                className="py-1.5 px-2 font-bold text-foreground truncate max-w-[120px]"
                title={equipoVisitante.nombre}
              >
                {equipoVisitante.nombre}
              </td>
              {periodos.map((p, idx) => (
                <td
                  key={p.id ?? idx}
                  className="py-1.5 px-2 text-center font-mono font-bold text-foreground text-[10px]"
                >
                  {p.scoreVisitante ?? 0}
                </td>
              ))}
              <td className="py-1.5 px-2 text-right font-black font-mono text-primary text-[10px]">
                {totalVisitante}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
