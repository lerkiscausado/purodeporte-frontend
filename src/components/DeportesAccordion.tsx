"use client";

import { useState } from "react";
import Link from "next/link";
import { FaFutbol, FaBasketballBall, FaVolleyballBall, FaTrophy, FaChevronDown, FaRegCircle } from "react-icons/fa";
import { Badge } from "./ui/badge";

interface TorneoMin {
  id: number;
  name: string;
  estado: string;
}

interface DeportesData {
  [deporteKey: string]: {
    [ramaKey: string]: TorneoMin[];
  };
}

interface DeportesAccordionProps {
  deportesData: DeportesData;
}

const sportNames: Record<string, string> = {
  baloncesto: "Baloncesto",
  futbol: "Fútbol",
  volibol: "Voleibol",
  microfutbol: "Microfútbol",
  golito: "Golito",
};

const ramaNames: Record<string, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  mixto: "Mixto",
};

export function DeportesAccordion({ deportesData }: DeportesAccordionProps) {
  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const [expandedRamas, setExpandedRamas] = useState<string[]>([]);

  if (!deportesData || Object.keys(deportesData).length === 0) {
    return (
      <div className="text-center py-6 border border-dashed border-border/40 rounded-sm bg-card">
        <p className="text-xs text-muted-foreground font-medium">No hay deportes ni torneos disponibles.</p>
      </div>
    );
  }

  const toggleSport = (sportKey: string) => {
    setExpandedSport(expandedSport === sportKey ? null : sportKey);
  };

  const toggleRama = (sportKey: string, ramaKey: string) => {
    const id = `${sportKey}-${ramaKey}`;
    setExpandedRamas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getSportIcon = (deporteKey: string) => {
    switch (deporteKey.toLowerCase()) {
      case "futbol":
      case "microfutbol":
      case "golito":
        return <FaFutbol className="h-4 w-4 text-emerald-400" />;
      case "baloncesto":
        return <FaBasketballBall className="h-4 w-4 text-orange-400" />;
      case "volibol":
        return <FaVolleyballBall className="h-4 w-4 text-indigo-400" />;
      default:
        return <FaTrophy className="h-4 w-4 text-primary" />;
    }
  };

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case "En Juego":
        return "default";
      case "Inscripciones":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-2">
      {Object.entries(deportesData).map(([sportKey, ramas]) => {
        // Calcular el número total de torneos en este deporte
        const totalTorneos = Object.values(ramas).reduce((sum, list) => sum + list.length, 0);
        const isExpanded = expandedSport === sportKey;
        const displayName = sportNames[sportKey] || sportKey.charAt(0).toUpperCase() + sportKey.slice(1);

        return (
          <div
            key={sportKey}
            className="border border-border/60 rounded-lg overflow-hidden bg-card shadow-sm transition-all duration-200"
          >
            {/* Header del Deporte */}
            <button
              onClick={() => toggleSport(sportKey)}
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/40 text-foreground font-bold text-sm tracking-wide text-left cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-center gap-2.5">
                {getSportIcon(sportKey)}
                <span className="capitalize font-black text-foreground">{displayName}</span>
              </div>
              <div className="flex items-center gap-3">
                {totalTorneos > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                    {totalTorneos} {totalTorneos === 1 ? "Torneo" : "Torneos"}
                  </span>
                )}
                <FaChevronDown
                  className={`h-3 w-3 text-foreground/50 transition-transform duration-250 ${
                    isExpanded ? "rotate-180 text-primary" : ""
                  }`}
                />
              </div>
            </button>

            {/* Contenido (Categorías y Torneos) */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isExpanded ? "max-h-[800px] border-t border-border/40 py-2" : "max-h-0"
              }`}
            >
              <div className="px-4 py-1 space-y-4">
                {Object.entries(ramas).map(([ramaKey, torneosList]) => {
                  if (torneosList.length === 0) return null;
                  const ramaDisplayName = ramaNames[ramaKey] || ramaKey.charAt(0).toUpperCase() + ramaKey.slice(1);
                  const ramaId = `${sportKey}-${ramaKey}`;
                  const isRamaExpanded = expandedRamas.includes(ramaId);

                  return (
                    <div key={ramaKey} className="border border-border/40 rounded-md overflow-hidden bg-accent/5">
                      {/* Sub-Header de la Categoría */}
                      <button
                        onClick={() => toggleRama(sportKey, ramaKey)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-accent/10 hover:bg-accent/25 text-left text-xs font-bold text-foreground cursor-pointer transition-colors duration-150"
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                          {ramaDisplayName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/5 text-foreground/75 border border-foreground/10">
                            {torneosList.length}
                          </span>
                          <FaChevronDown
                            className={`h-2.5 w-2.5 text-foreground/50 transition-transform duration-250 ${
                              isRamaExpanded ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Lista de Torneos */}
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isRamaExpanded ? "max-h-[500px] py-1.5 px-2 border-t border-border/30" : "max-h-0"
                        }`}
                      >
                        <div className="space-y-1">
                          {torneosList.map((torneo) => (
                            <Link
                              key={torneo.id}
                              href={`/torneos/${torneo.id}`}
                              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-accent/30 text-xs text-foreground/85 hover:text-primary transition-all group"
                            >
                              <span className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                {torneo.name}
                              </span>
                              <Badge
                                variant={getBadgeVariant(torneo.estado)}
                                className="text-[8px] uppercase tracking-wider h-3.5 px-1 py-0 rounded-sm scale-90"
                              >
                                {torneo.estado}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {totalTorneos === 0 && (
                  <p className="text-[11px] italic text-muted-foreground py-2">
                    No hay torneos activos en este deporte.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
