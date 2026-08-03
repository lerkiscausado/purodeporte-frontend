"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FaSave,
  FaArrowLeft,
  FaCheck,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaTrophy,
  FaUsers,
  FaInfoCircle,
  FaChevronDown,
  FaHandshake,
  FaAward,
} from "react-icons/fa";
import Link from "next/link";
import { getEscenarios } from "@/app/actions/escenarios";
import { getInscripcionesPorTorneo } from "@/app/actions/inscripciones";
import { createPartido } from "@/app/actions/partidos";
import { SelectSearch } from "@/components/SelectSearch";
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
  disabledPlaceholder = "Elige primero el local",
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
      t.representante.toLowerCase().includes(term)
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
    <div ref={containerRef} className="relative w-full">
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
          <div className="p-2 border-b border-border/40 bg-muted/20">
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


interface ProgramarPartidoClientProps {
  torneo: any;
}

export function ProgramarPartidoClient({ torneo }: ProgramarPartidoClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Controlled states for selects
  const [idEquipoLocal, setIdEquipoLocal] = useState<string>("");
  const [idEquipoVisitante, setIdEquipoVisitante] = useState<string>("");
  const [idEscenario, setIdEscenario] = useState<number | undefined>(
    torneo?.escenario?.id || undefined
  );
  const [tipoJuego, setTipoJuego] = useState<string>("OFICIAL");

  // Data states
  const [equipos, setEquipos] = useState<any[]>([]);
  const [loadingEquipos, setLoadingEquipos] = useState<boolean>(true);
  const [escenarios, setEscenarios] = useState<any[]>([]);
  const [loadingEscenarios, setLoadingEscenarios] = useState<boolean>(true);

  const router = useRouter();

  // Load scenarios and teams on mount
  // Load scenarios and registered teams on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [escResult, insResult] = await Promise.all([
          getEscenarios(),
          getInscripcionesPorTorneo(Number(torneo.id)),
        ]);

        if (escResult.success && escResult.data) {
          setEscenarios(escResult.data);
        } else {
          console.error("Error al cargar escenarios:", escResult.error);
        }

        if (insResult.success && insResult.data) {
          const equiposInscritos = insResult.data.map((insc: any) => insc.equipo);
          setEquipos(equiposInscritos);
        } else {
          console.error("Error al cargar equipos inscritos:", insResult.error);
        }
      } catch (err) {
        console.error("Excepción al cargar datos:", err);
      } finally {
        setLoadingEscenarios(false);
        setLoadingEquipos(false);
      }
    }
    loadData();
  }, [torneo.id]);

  // Solo los equipos inscritos en el torneo
  const equiposFiltrados = equipos;

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

    if (!idEquipoLocal) {
      setError("Debes seleccionar el equipo local.");
      return;
    }
    if (!idEquipoVisitante) {
      setError("Debes seleccionar el equipo visitante.");
      return;
    }
    if (idEquipoLocal === idEquipoVisitante) {
      setError("El equipo local y el visitante no pueden ser el mismo.");
      return;
    }
    if (!idEscenario) {
      setError("Debes seleccionar el escenario de juego.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("idTorneo", torneo.id.toString());
    formData.set("idEquipoLocal", idEquipoLocal);
    formData.set("idEquipoVisitante", idEquipoVisitante);
    formData.set("idEscenario", idEscenario.toString());
    formData.set("tipoJuego", tipoJuego);

    startTransition(async () => {
      const result = await createPartido(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard/torneos/gestionar-torneo?id=${torneo.id}`);
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
          href={`/dashboard/torneos/gestionar-torneo?id=${torneo.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Gestión de Torneo
        </Link>
        <h1 className="text-3xl font-black tracking-tight uppercase">Programar Partido</h1>
        <p className="text-muted-foreground text-sm">Registra un nuevo encuentro oficial dentro de la competición.</p>
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
      <Card className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/15 p-6">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <FaCalendarAlt className="text-primary h-5 w-5" />
            Detalles del Encuentro
          </CardTitle>
          <CardDescription className="text-xs">
            Selecciona los contendientes, escenario, fecha y hora del encuentro deportivo.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Contendientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Equipo Local */}
              <div className="space-y-2">
                <Label className="font-bold text-sm flex items-center gap-1.5">
                  <FaUsers className="text-muted-foreground h-4 w-4" />
                  Equipo Local
                </Label>
                {loadingEquipos ? (
                  <div className="w-full bg-card h-14 border border-border/60 rounded-sm px-4 flex items-center text-muted-foreground text-sm font-medium animate-pulse">
                    Cargando equipos...
                  </div>
                ) : (
                  <TeamSelect
                    teams={equiposFiltrados}
                    selectedValue={idEquipoLocal}
                    onChange={(val) => {
                      setIdEquipoLocal(val);
                      if (val === idEquipoVisitante) setIdEquipoVisitante("");
                    }}
                    placeholder="Selecciona el equipo local"
                    icon={<FaUsers className="h-4 w-4 text-muted-foreground" />}
                  />
                )}
              </div>

              {/* Equipo Visitante */}
              <div className="space-y-2">
                <Label className="font-bold text-sm flex items-center gap-1.5">
                  <FaUsers className="text-muted-foreground h-4 w-4" />
                  Equipo Visitante
                </Label>
                {loadingEquipos ? (
                  <div className="w-full bg-card h-14 border border-border/60 rounded-sm px-4 flex items-center text-muted-foreground text-sm font-medium animate-pulse">
                    Cargando equipos...
                  </div>
                ) : (
                  <TeamSelect
                    teams={equiposFiltrados.filter((eq) => eq.id.toString() !== idEquipoLocal)}
                    selectedValue={idEquipoVisitante}
                    onChange={(val) => setIdEquipoVisitante(val)}
                    placeholder="Selecciona el equipo visitante"
                    disabled={!idEquipoLocal}
                    disabledPlaceholder="Elige primero el local"
                    icon={<FaUsers className="h-4 w-4 text-muted-foreground" />}
                  />
                )}
              </div>
            </div>

            {/* Escenario Deportivo (Buscador Premium) */}
            <div className="space-y-2">
              <Label className="font-bold text-sm flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-sky-500 h-4 w-4" />
                Escenario Deportivo
              </Label>
              <SelectSearch
                items={escenarios}
                placeholder="Selecciona el escenario de juego..."
                value={idEscenario}
                onChange={(val) => setIdEscenario(val)}
                loading={loadingEscenarios}
              />
              {escenarios.length === 0 && !loadingEscenarios && (
                <p className="text-[10px] text-destructive mt-1 font-semibold flex items-center gap-1">
                  <FaInfoCircle className="h-3.5 w-3.5" />
                  No tienes escenarios registrados. Debes registrar al menos uno para poder programar un partido.
                </p>
              )}
            </div>

            {/* Tipo de Juego */}
            <div className="space-y-3">
              <Label className="font-bold text-sm flex items-center gap-1.5">
                <FaTrophy className="text-amber-500 h-4 w-4" />
                Tipo de Juego
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* OFICIAL */}
                <button
                  type="button"
                  onClick={() => setTipoJuego("OFICIAL")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    tipoJuego === "OFICIAL"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center mb-2.5 transition-colors shrink-0",
                    tipoJuego === "OFICIAL"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                  )}>
                    <FaTrophy className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider block">OFICIAL</span>
                  <span className="text-[10px] text-muted-foreground mt-1 font-semibold leading-normal block">
                    Válido por puntos
                  </span>
                  {tipoJuego === "OFICIAL" && (
                    <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />
                  )}
                </button>

                {/* AMISTOSO */}
                <button
                  type="button"
                  onClick={() => setTipoJuego("AMISTOSO")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    tipoJuego === "AMISTOSO"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center mb-2.5 transition-colors shrink-0",
                    tipoJuego === "AMISTOSO"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                  )}>
                    <FaHandshake className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider block">AMISTOSO</span>
                  <span className="text-[10px] text-muted-foreground mt-1 font-semibold leading-normal block">
                    Sin impacto en tabla
                  </span>
                  {tipoJuego === "AMISTOSO" && (
                    <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />
                  )}
                </button>

                {/* LIGUILLA */}
                <button
                  type="button"
                  onClick={() => setTipoJuego("LIGUILLA")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    tipoJuego === "LIGUILLA"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center mb-2.5 transition-colors shrink-0",
                    tipoJuego === "LIGUILLA"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                  )}>
                    <FaAward className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider block">LIGUILLA</span>
                  <span className="text-[10px] text-muted-foreground mt-1 font-semibold leading-normal block">
                    Fase eliminatoria
                  </span>
                  {tipoJuego === "LIGUILLA" && (
                    <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha" className="font-bold text-sm flex items-center gap-1.5">
                  <FaCalendarAlt className="text-muted-foreground h-4 w-4" />
                  Fecha del Encuentro
                </Label>
                <div className="relative">
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    required
                    className="bg-card h-12 border-border/60 rounded-sm pl-10 text-sm"
                  />
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4 pointer-events-none" />
                </div>
              </div>

              {/* Hora */}
              <div className="space-y-2">
                <Label htmlFor="hora" className="font-bold text-sm flex items-center gap-1.5">
                  <FaClock className="text-muted-foreground h-4 w-4" />
                  Hora de Inicio
                </Label>
                <div className="relative">
                  <Input
                    id="hora"
                    name="hora"
                    type="time"
                    required
                    className="bg-card h-12 border-border/60 rounded-sm pl-10 text-sm"
                  />
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Descripción / Notas */}
            <div className="space-y-2">
              <Label htmlFor="descripcion" className="font-bold text-sm">Descripción o Notas Adicionales (Opcional)</Label>
              <textarea
                id="descripcion"
                name="descripcion"
                placeholder="Ej: Vestimenta alternativa de color blanco para el equipo visitante. Reunión de capitanes 15 minutos antes."
                className="flex min-h-[90px] w-full rounded-sm border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 border-border/60 transition-all duration-150"
              />
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
                Partido programado exitosamente. Redirigiendo...
              </div>
            )}

            {/* Botón de Enviar */}
            <Button
              type="submit"
              disabled={isPending || success}
              className="w-full font-bold h-12 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none mt-2 uppercase tracking-wider text-xs"
            >
              <FaSave className="mr-2 h-4 w-4" />
              {isPending ? "Programando Partido..." : "Confirmar Programación"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
