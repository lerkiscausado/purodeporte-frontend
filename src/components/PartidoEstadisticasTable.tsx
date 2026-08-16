import {
  getColumnsForSport,
  extractTiposFromStats,
  getStatQuantity,
} from "@/lib/estadisticasColumnas";
import { cn } from "@/lib/utils";

interface PartidoEstadisticasTableProps {
  stats: any[];
  deporte?: string;
  className?: string;
}

export function PartidoEstadisticasTable({
  stats,
  deporte = "Futbol",
  className,
}: PartidoEstadisticasTableProps) {
  if (!stats || stats.length === 0) {
    return null;
  }

  const tipos = extractTiposFromStats(stats);
  const columns = getColumnsForSport(deporte, tipos);

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-sm border border-border/50 bg-muted/20",
        className
      )}
    >
      <table className="w-full text-left text-[11px]">
        <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground border-b border-border/40 font-bold">
          <tr>
            <th className="py-1.5 px-2 text-center w-8">#</th>
            <th className="py-1.5 px-2">Jugador</th>
            <th className="py-1.5 px-2">Equipo</th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "py-1.5 px-2 whitespace-nowrap",
                  col.isPoints ? "text-right" : "text-center"
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {stats.map((item: any, idx: number) => {
            const jugador = item.jugador || {};
            const jNombre =
              `${jugador.nombre || jugador.nombres || ""} ${
                jugador.apellidos || jugador.apellido || ""
              }`.trim() || `Jugador #${jugador.id || idx + 1}`;
            const equipo = item.equipo || {};
            const eqNombre = equipo.nombre || "Equipo";
            const numeroCamiseta = item.numeroCamiseta ?? "-";

            return (
              <tr key={idx} className="hover:bg-muted/40 transition-colors">
                <td className="py-1.5 px-2 text-center font-mono font-bold text-muted-foreground text-[10px] w-8">
                  {numeroCamiseta}
                </td>
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
                {columns.map((col) => {
                  if (col.isPoints) {
                    return (
                      <td
                        key={col.key}
                        className="py-1.5 px-2 text-right font-black font-mono text-primary text-[10px]"
                      >
                        {item.totalPuntos ?? "-"}
                      </td>
                    );
                  }
                  const qty = getStatQuantity(item, col);
                  return (
                    <td
                      key={col.key}
                      className="py-1.5 px-2 text-center font-mono font-bold text-foreground text-[10px]"
                    >
                      {qty > 0 ? (
                        qty
                      ) : (
                        <span className="text-muted-foreground/30 font-normal">0</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <tfoot className="border-t-2 border-border/60 bg-muted/40 font-bold">
          <tr>
            <td className="py-1.5 px-2 text-center text-muted-foreground text-[10px] w-8"></td>
            <td className="py-1.5 px-2 font-black text-foreground uppercase tracking-tight text-[11px]">
              TOTAL
            </td>
            <td className="py-1.5 px-2"></td>
            {columns.map((col) => {
              if (col.isPoints) {
                const totalPts = stats.reduce(
                  (sum: number, item: any) => sum + (Number(item.totalPuntos) || 0),
                  0
                );
                return (
                  <td
                    key={col.key}
                    className="py-1.5 px-2 text-right font-black font-mono text-primary text-[10px]"
                  >
                    {totalPts}
                  </td>
                );
              }
              const totalCol = stats.reduce(
                (sum: number, item: any) => sum + getStatQuantity(item, col),
                0
              );
              return (
                <td
                  key={col.key}
                  className="py-1.5 px-2 text-center font-black font-mono text-foreground text-[10px]"
                >
                  {totalCol}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
