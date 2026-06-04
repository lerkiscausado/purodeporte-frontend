import { Torneo } from "@/types";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { FaFutbol, FaBasketballBall, FaVolleyballBall, FaTrophy, FaMapMarkerAlt, FaRunning } from "react-icons/fa";

interface CardTorneoProps {
  torneo: Torneo;
}

export function CardTorneo({ torneo }: CardTorneoProps) {
  const getBadgeVariant = (estado: Torneo["estado"]) => {
    switch (estado) {
      case "En Juego": return "default";
      case "Inscripciones": return "secondary";
      case "Finalizado": return "outline";
      default: return "outline";
    }
  };

  const getSportIcon = (deporte: string) => {
    if (!deporte) return <FaTrophy className="h-3.5 w-3.5 text-primary" />;
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer") || dep.includes("futsal") || dep.includes("golito")) {
      return <FaFutbol className="h-3.5 w-3.5 text-emerald-500" />;
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return <FaBasketballBall className="h-3.5 w-3.5 text-orange-500" />;
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return <FaVolleyballBall className="h-3.5 w-3.5 text-indigo-500" />;
    }
    if (dep.includes("running") || dep.includes("atletismo")) {
      return <FaRunning className="h-3.5 w-3.5 text-blue-500" />;
    }
    return <FaTrophy className="h-3.5 w-3.5 text-primary" />;
  };

  const tournamentName = torneo.nombre || (torneo as any).name;

  return (
    <Link href={`/torneos/${torneo.id}`}>
      <div className="group border-l-4 border-l-primary/70 bg-card hover:bg-accent/50 border border-border/60 rounded-sm px-3 py-2.5 transition-colors duration-150 cursor-pointer mb-1 flex flex-col justify-between h-full shadow-sm hover:shadow-md">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <Badge variant={getBadgeVariant(torneo.estado)} className="uppercase tracking-wider text-[9px] font-bold px-1.5 py-0 h-4 rounded-sm">
              {torneo.estado}
            </Badge>
            <div className="flex items-center gap-1.5 text-muted-foreground/60 min-w-0">
              {getSportIcon(torneo.deporte)}
              <span className="text-[10px] font-bold uppercase tracking-wider truncate">{torneo.deporte}</span>
            </div>
          </div>
          <p className="text-sm font-black leading-snug group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-2" title={tournamentName}>
            {tournamentName}
          </p>
        </div>
        <div className="space-y-1.5 mt-2.5 pt-2 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium">
            <span className="bg-primary/10 text-primary w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">F</span>
            <span className="font-semibold text-foreground/80">
              {new Date(torneo.fechaInicio).toLocaleDateString("es-CO", { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </p>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-semibold" title={torneo.escenario?.nombre || "Sin escenario asignado"}>
            <FaMapMarkerAlt className="h-3.5 w-3.5 text-sky-500 shrink-0" />
            {torneo.escenario ? (
              <span className="truncate text-foreground/80 font-bold">{torneo.escenario.nombre}</span>
            ) : (
              <span className="truncate italic text-muted-foreground/60 font-medium">Sin escenario principal</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

