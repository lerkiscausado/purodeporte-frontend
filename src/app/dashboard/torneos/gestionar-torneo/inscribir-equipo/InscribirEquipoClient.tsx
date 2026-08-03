"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  FaSave,
  FaArrowLeft,
  FaCheck,
  FaUsers,
  FaTrophy,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaChevronDown,
  FaUser,
} from "react-icons/fa";
import Link from "next/link";
import { getMisEquipos } from "@/app/actions/equipos";
import { getInscripcionesPorTorneo, createInscripcion } from "@/app/actions/inscripciones";
import { cn } from "@/lib/utils";
import { getUploadUrl } from "@/lib/uploads";

interface TeamSelectProps {
  teams: any[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
  icon?: React.ReactNode;
}

function TeamSelect({
  teams,
  selectedValue,
  onChange,
  placeholder,
  disabled = false,
  disabledPlaceholder = "Selecciona un equipo",
  icon,
}: TeamSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedTeam = teams.find((t) => t.id.toString() === selectedValue);

  const filteredTeams = teams.filter((t) => {
    const term = search.toLowerCase();
    return (
      t.nombre.toLowerCase().includes(term) ||
      (t.representante && t.representante.toLowerCase().includes(term))
    );
  });

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getGradientBg = (name: string) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-rose-500 to-orange-500",
      "from-violet-600 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-blue-600 to-cyan-500",
      "from-amber-500 to-yellow-500",
      "from-fuchsia-600 to-pink-600",
    ];
    return colors[hash % colors.length];
  };

  return (
    <div ref={containerRef} className="relative w-full text-foreground animate-fadeIn">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-card h-14 border border-border/60 rounded-sm px-4 flex items-center justify-between text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen && "ring-2 ring-primary/20 border-primary/50"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedTeam ? (
            <>
              {selectedTeam.foto ? (
                <img
                  src={getUploadUrl("equipos", selectedTeam.foto)}
                  alt={selectedTeam.nombre}
                  className="h-8 w-8 rounded-full object-cover border border-border/60 shrink-0"
                />
              ) : (
                <div className={cn(
                  "h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br shadow-sm uppercase",
                  getGradientBg(selectedTeam.nombre)
                )}>
                  {getInitials(selectedTeam.nombre)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase text-foreground truncate leading-tight">
                  {selectedTeam.nombre}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                  Rep: {selectedTeam.representante}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              {icon}
              <span className="truncate">{disabled ? disabledPlaceholder : placeholder}</span>
            </div>
          )}
        </div>
        <FaChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-popover text-popover-foreground border border-border/80 rounded-sm shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-border/45 bg-muted/20">
            <input
              type="text"
              placeholder="Buscar equipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card h-9 border border-border/60 rounded-sm text-xs px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto scrollbar-thin py-1">
            {filteredTeams.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground font-semibold">
                No se encontraron equipos
              </div>
            ) : (
              filteredTeams.map((team) => {
                const isSelected = team.id.toString() === selectedValue;
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      onChange(team.id.toString());
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex items-center justify-between w-full p-3 text-left transition-all border-b border-border/10 last:border-b-0 hover:bg-muted/45",
                      isSelected && "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {team.foto ? (
                        <img
                          src={getUploadUrl("equipos", team.foto)}
                          alt={team.nombre}
                          className="h-9 w-9 rounded-full object-cover border border-border/60 shrink-0"
                        />
                      ) : (
                        <div className={cn(
                          "h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-white bg-gradient-to-br shadow-sm uppercase",
                          getGradientBg(team.nombre)
                        )}>
                          {getInitials(team.nombre)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase text-foreground leading-tight truncate">
                          {team.nombre}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium leading-none">
                          Rep: {team.representante}
                        </p>
                      </div>
                    </div>
                    {isSelected && <FaCheck className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface InscribirEquipoClientProps {
  torneo: any;
}

export function InscribirEquipoClient({ torneo }: InscribirEquipoClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const [selectedEquipoId, setSelectedEquipoId] = useState<string>("");
  const [allEquipos, setAllEquipos] = useState<any[]>([]);
  const [loadingEquipos, setLoadingEquipos] = useState<boolean>(true);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [loadingInscripciones, setLoadingInscripciones] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [eqResult, inscResult] = await Promise.all([
          getMisEquipos(),
          getInscripcionesPorTorneo(Number(torneo.id)),
        ]);

        if (eqResult.success && eqResult.data) {
          setAllEquipos(eqResult.data);
        } else {
          console.error("Error al cargar equipos:", eqResult.error);
        }

        if (inscResult.success && inscResult.data) {
          setInscripciones(inscResult.data);
        } else {
          console.error("Error al cargar inscripciones:", inscResult.error);
        }
      } catch (err) {
        console.error("Excepción al cargar datos:", err);
      } finally {
        setLoadingEquipos(false);
        setLoadingInscripciones(false);
      }
    }
    loadData();
  }, [torneo.id]);

  // Helper de filtrado por deporte
  const isSportMatching = (torneoDeporte: string, equipoDeporte: string) => {
    if (!torneoDeporte || !equipoDeporte) return false;
    const tDep = torneoDeporte.toLowerCase().trim();
    const eDep = equipoDeporte.toLowerCase().trim();

    // fútbol, futsal, golito, microfútbol son variantes de fútbol
    const isFutbol = (dep: string) => 
      dep.includes("futbol") ||
      dep.includes("fútbol") ||
      dep.includes("soccer") ||
      dep.includes("golito") ||
      dep.includes("microfutbol") ||
      dep.includes("futsal");

    if (isFutbol(tDep)) {
      return isFutbol(eDep);
    }

    const isBasket = (dep: string) =>
      dep.includes("basket") || dep.includes("baloncesto");

    if (isBasket(tDep)) {
      return isBasket(eDep);
    }

    const isVoley = (dep: string) =>
      dep.includes("voley") || dep.includes("voleibol");

    if (isVoley(tDep)) {
      return isVoley(eDep);
    }

    // Fallback para cualquier otra disciplina (ej. Tenis de Mesa, Atletismo, etc.)
    return tDep === eDep || tDep.includes(eDep) || eDep.includes(tDep);
  };

  // Filtrar equipos por deporte y excluir los ya inscritos
  const equiposFiltradosPorDeporte = allEquipos.filter((equipo) => {
    const matchingSport = isSportMatching(torneo.deporte, equipo.deporte);
    const alreadyInscribed = inscripciones.some((insc) => insc.equipo?.id === equipo.id);
    return matchingSport && !alreadyInscribed;
  });

  // Mapear iconos pequeños por deporte
  const getSportIcon = (deporte: string) => {
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer") || dep.includes("golito")) {
      return <FaFutbol className="h-5 w-5 text-emerald-500" />;
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return <FaBasketballBall className="h-5 w-5 text-orange-500" />;
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return <FaVolleyballBall className="h-5 w-5 text-indigo-500" />;
    }
    return <FaTrophy className="h-5 w-5 text-primary" />;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedEquipoId) {
      setError("Debes seleccionar un equipo a inscribir.");
      return;
    }

    startTransition(async () => {
      const result = await createInscripcion(Number(torneo.id), Number(selectedEquipoId));
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard/torneos/gestionar-torneo?id=${torneo.id}&tab=equipos`);
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Cabecera */}
      <div>
        <Link
          href={`/dashboard/torneos/gestionar-torneo?id=${torneo.id}&tab=equipos`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Gestión de Torneo
        </Link>
        <h1 className="text-3xl font-black tracking-tight uppercase">Inscribir Equipo</h1>
        <p className="text-muted-foreground text-sm">Registra una nueva delegación oficial dentro del torneo.</p>
      </div>

      {/* Tarjeta de Información del Torneo */}
      <Card className="border-border/60 bg-muted/10 shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
            {getSportIcon(torneo.deporte)}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Torneo Seleccionado</span>
            <h2 className="text-sm font-black uppercase text-foreground leading-tight truncate">{torneo.name}</h2>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">
              {torneo.deporte} • Categoría {torneo.rama}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulario */}
      <Card className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-visible">
        <CardHeader className="border-b border-border/60 bg-muted/15 p-6">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <FaUsers className="text-primary h-5 w-5" />
            Detalles de la Inscripción
          </CardTitle>
          <CardDescription className="text-xs">
            Selecciona el equipo correspondiente para formalizar su participación activa en esta competencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-sm flex items-center gap-1.5 mb-1.5">
                <FaUsers className="text-muted-foreground h-4 w-4" />
                Equipo a Inscribir
              </Label>
              {loadingEquipos || loadingInscripciones ? (
                <div className="w-full bg-[oklch(0.25_0.04_255)] h-14 border border-white/10 rounded-sm px-4 flex items-center text-white/60 text-xs font-semibold animate-pulse">
                  Cargando información del sistema...
                </div>
              ) : equiposFiltradosPorDeporte.length === 0 ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm text-amber-500 text-xs font-semibold space-y-2">
                  <p>
                    No hay equipos de la disciplina <strong>{torneo.deporte}</strong> disponibles para inscribir en este momento.
                  </p>
                  <p className="text-[11px] opacity-80 leading-normal">
                    Esto se debe a que todos los equipos elegibles ya han sido inscritos o aún no has registrado equipos que correspondan al deporte de este torneo.
                  </p>
                </div>
              ) : (
                <TeamSelect
                  teams={equiposFiltradosPorDeporte}
                  selectedValue={selectedEquipoId}
                  onChange={(val) => {
                    setSelectedEquipoId(val);
                    setError(null);
                  }}
                  placeholder="Selecciona el equipo a registrar..."
                  icon={<FaUsers className="h-4 w-4 text-white/50" />}
                />
              )}
            </div>

            {/* Mensajes de Feedback */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <FaCheck className="h-4 w-4" />
                ¡Equipo inscrito exitosamente! Redirigiendo a gestión de torneo...
              </div>
            )}

            {/* Botón de Enviar */}
            <Button
              type="submit"
              disabled={isPending || success || loadingEquipos || loadingInscripciones || equiposFiltradosPorDeporte.length === 0}
              className="w-full font-bold h-12 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none mt-2 uppercase tracking-wider text-xs flex items-center justify-center gap-2"
            >
              <FaSave className="h-4 w-4" />
              {isPending ? "Inscribiendo..." : "Confirmar Inscripción"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
