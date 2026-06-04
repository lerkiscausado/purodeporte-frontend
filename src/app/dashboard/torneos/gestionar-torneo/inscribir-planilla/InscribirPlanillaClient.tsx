"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FaTrash,
  FaIdCard,
  FaClipboardList,
} from "react-icons/fa";
import Link from "next/link";
import { getJugadores } from "@/app/actions/jugadores";
import { getPlanillasPorTorneo, createPlanilla, deletePlanilla } from "@/app/actions/planillas";
import { cn } from "@/lib/utils";

interface PlayerSelectProps {
  players: any[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
  icon?: React.ReactNode;
}

function PlayerSelect({
  players,
  selectedValue,
  onChange,
  placeholder,
  disabled = false,
  disabledPlaceholder = "Selecciona un jugador",
  icon,
}: PlayerSelectProps) {
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

  const selectedPlayer = players.find((p) => p.id.toString() === selectedValue);

  const filteredPlayers = players.filter((p) => {
    const term = search.toLowerCase();
    const fullName = `${p.nombre} ${p.apellidos}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (p.identificacion && p.identificacion.toLowerCase().includes(term))
    );
  });

  const getInitials = (name: string, lastName: string) => {
    return `${name.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase();
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
          {selectedPlayer ? (
            <>
              <div className={cn(
                "h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br shadow-sm uppercase",
                getGradientBg(selectedPlayer.nombre)
              )}>
                {getInitials(selectedPlayer.nombre, selectedPlayer.apellidos)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase text-foreground truncate leading-tight">
                  {selectedPlayer.nombre} {selectedPlayer.apellidos}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                  ID: {selectedPlayer.identificacion || "No registrada"} • Género: {selectedPlayer.genero}
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
              placeholder="Buscar deportista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card h-9 border border-border/60 rounded-sm text-xs px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto scrollbar-thin py-1">
            {filteredPlayers.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground font-semibold">
                No se encontraron deportistas
              </div>
            ) : (
              filteredPlayers.map((p) => {
                const isSelected = p.id.toString() === selectedValue;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChange(p.id.toString());
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex items-center justify-between w-full p-3 text-left transition-all border-b border-border/10 last:border-b-0 hover:bg-muted/45",
                      isSelected && "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-white bg-gradient-to-br shadow-sm uppercase",
                        getGradientBg(p.nombre)
                      )}>
                        {getInitials(p.nombre, p.apellidos)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase text-foreground leading-tight truncate">
                          {p.nombre} {p.apellidos}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium leading-none">
                          ID: {p.identificacion || "No registrada"} • G: {p.genero}
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

interface InscribirPlanillaClientProps {
  torneo: any;
  equipo: any;
}

export function InscribirPlanillaClient({ torneo, equipo }: InscribirPlanillaClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [camiseta, setCamiseta] = useState<string>("");
  
  const [allJugadores, setAllJugadores] = useState<any[]>([]);
  const [loadingJugadores, setLoadingJugadores] = useState<boolean>(true);
  
  const [planillaList, setPlanillaList] = useState<any[]>([]);
  const [loadingPlanilla, setLoadingPlanilla] = useState<boolean>(true);

  const router = useRouter();

  // Cargar jugadores y planilla actual del torneo
  const loadData = async () => {
    try {
      setLoadingJugadores(true);
      setLoadingPlanilla(true);

      const [jugResult, planResult] = await Promise.all([
        getJugadores(),
        getPlanillasPorTorneo(Number(torneo.id)),
      ]);

      if (jugResult.success && jugResult.data) {
        setAllJugadores(jugResult.data);
      } else {
        console.error("Error al cargar jugadores:", jugResult.error);
      }

      if (planResult.success && planResult.data) {
        // Filtrar planillas que corresponden a este equipo
        const teamPlanilla = planResult.data.filter(
          (p: any) => p.equipo?.id === equipo.id
        );
        setPlanillaList(teamPlanilla);
      } else {
        console.error("Error al cargar planilla del torneo:", planResult.error);
      }
    } catch (err) {
      console.error("Excepción al cargar datos:", err);
    } finally {
      setLoadingJugadores(false);
      setLoadingPlanilla(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [torneo.id, equipo.id]);

  // Excluir jugadores que ya están inscritos en la planilla de este equipo y filtrar por el género de la rama
  const jugadoresDisponibles = allJugadores.filter((jug) => {
    // 1. Excluir ya inscritos
    const yaInscrito = planillaList.some((p) => p.jugador?.id === jug.id);
    if (yaInscrito) return false;

    // 2. Filtrar por rama del torneo (Masculino -> Hombre, Femenino -> Mujer, Mixto -> Todos)
    const rama = torneo.rama?.toLowerCase() || "";
    const generoJugador = jug.genero?.toLowerCase() || "";

    if (rama === "masculino") {
      return generoJugador === "hombre";
    }
    if (rama === "femenino") {
      return generoJugador === "mujer";
    }
    // Para Mixto muestra todos
    return true;
  });

  const getInitials = (name: string, lastName: string = "") => {
    return `${name.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase();
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

  // Mapear iconos pequeños por deporte
  const getSportIcon = (deporte: string) => {
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer")) {
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

    if (!selectedPlayerId) {
      setError("Debes seleccionar un jugador a inscribir.");
      return;
    }

    if (!camiseta || isNaN(Number(camiseta)) || Number(camiseta) < 0) {
      setError("Debes ingresar un número de camiseta válido (mayor o igual a 0).");
      return;
    }

    startTransition(async () => {
      const result = await createPlanilla(
        Number(torneo.id),
        Number(equipo.id),
        Number(selectedPlayerId),
        Number(camiseta)
      );

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setSelectedPlayerId("");
        setCamiseta("");
        // Recargar la lista localmente de forma asíncrona
        await loadData();
        setSuccess(false);
      }
    });
  };

  const handleEliminarPlanilla = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas retirar a este jugador de la planilla?")) {
      return;
    }
    try {
      const res = await deletePlanilla(id);
      if (res.error) {
        alert(res.error);
      } else {
        await loadData();
      }
    } catch (err) {
      console.error("Error al retirar jugador de la planilla:", err);
      alert("Error de conexión al retirar jugador.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Cabecera */}
      <div>
        <Link
          href={`/dashboard/torneos/gestionar-torneo?id=${torneo.id}&tab=equipos`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Gestión de Torneo
        </Link>
        <h1 className="text-3xl font-black tracking-tight uppercase">Inscribir Planilla</h1>
        <p className="text-muted-foreground text-sm">Gestiona y registra la nómina oficial del equipo en el torneo.</p>
      </div>

      {/* Tarjeta de Información Contextual (Torneo + Equipo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info Torneo */}
        <Card className="border-border/60 bg-muted/10 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
              {getSportIcon(torneo.deporte)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Torneo</span>
              <h2 className="text-sm font-black uppercase text-foreground leading-tight truncate">{torneo.name}</h2>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">
                {torneo.deporte} • Categoría {torneo.rama}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Equipo */}
        <Card className="border-border/60 bg-muted/10 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            {equipo.foto ? (
              <img
                src={equipo.foto}
                alt={equipo.nombre}
                className="h-10 w-10 rounded-full object-cover border border-border/60 shrink-0"
              />
            ) : (
              <div className={cn(
                "h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-white bg-gradient-to-br shadow-sm uppercase",
                getGradientBg(equipo.nombre)
              )}>
                {getInitials(equipo.nombre)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Equipo Seleccionado</span>
              <h2 className="text-sm font-black uppercase text-foreground leading-tight truncate">{equipo.nombre}</h2>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">
                Delegado: {equipo.representante}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulario de Inscripción */}
        <Card className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-visible lg:col-span-1">
          <CardHeader className="border-b border-border/60 bg-muted/15 p-5">
            <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <FaClipboardList className="text-primary h-5 w-5" />
              Inscribir Deportista
            </CardTitle>
            <CardDescription className="text-xs">
              Agrega un deportista a la nómina oficial del equipo.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seleccionar Jugador */}
              <div className="space-y-2">
                <Label className="font-bold text-xs flex items-center gap-1.5 mb-1">
                  <FaUser className="text-muted-foreground h-3.5 w-3.5" />
                  Jugador / Deportista
                </Label>
                {loadingJugadores || loadingPlanilla ? (
                  <div className="w-full bg-[oklch(0.25_0.04_255)] h-14 border border-white/10 rounded-sm px-4 flex items-center text-white/60 text-xs font-semibold animate-pulse">
                    Cargando deportistas...
                  </div>
                ) : jugadoresDisponibles.length === 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm text-amber-500 text-xs font-semibold">
                    <p>No hay deportistas disponibles para inscribir.</p>
                  </div>
                ) : (
                  <PlayerSelect
                    players={jugadoresDisponibles}
                    selectedValue={selectedPlayerId}
                    onChange={(val) => {
                      setSelectedPlayerId(val);
                      setError(null);
                    }}
                    placeholder="Buscar deportista..."
                    icon={<FaUser className="h-4 w-4 text-white/50" />}
                  />
                )}
              </div>

              {/* Número de Camiseta */}
              <div className="space-y-2">
                <Label className="font-bold text-xs flex items-center gap-1.5 mb-1" htmlFor="camiseta">
                  <span className="font-black text-muted-foreground text-sm">#</span>
                  Número de Camiseta
                </Label>
                <Input
                  id="camiseta"
                  type="number"
                  min="0"
                  max="999"
                  placeholder="Ej: 10"
                  value={camiseta}
                  onChange={(e) => {
                    setCamiseta(e.target.value);
                    setError(null);
                  }}
                  className="bg-card h-12 border border-border/60 rounded-sm px-4 text-sm font-semibold focus-visible:ring-primary/20"
                />
              </div>

              {/* Mensajes de Feedback */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-xs font-semibold text-center leading-normal">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-xs font-semibold text-center flex items-center justify-center gap-2">
                  <FaCheck className="h-4 w-4" />
                  ¡Inscripción exitosa!
                </div>
              )}

              {/* Botón de Enviar */}
              <Button
                type="submit"
                disabled={isPending || success || loadingJugadores || loadingPlanilla || jugadoresDisponibles.length === 0}
                className="w-full font-bold h-12 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              >
                <FaSave className="h-4 w-4" />
                {isPending ? "Inscribiendo..." : "Inscribir a Planilla"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabla de Nómina/Roster Actual */}
        <Card className="border-border/60 shadow-md lg:col-span-2">
          <CardHeader className="border-b border-border/50 bg-muted/15 flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-4">
            <div>
              <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <FaUsers className="text-primary h-4.5 w-4.5" />
                Nómina Oficial del Roster
              </CardTitle>
              <CardDescription className="text-xs">
                Deportistas inscritos y habilitados para jugar en este torneo.
              </CardDescription>
            </div>
            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-sm uppercase tracking-wide w-fit">
              {loadingPlanilla ? "..." : `${planillaList.length} Jugadores`}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {loadingPlanilla ? (
              <div className="p-12 text-center space-y-3">
                <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-xs text-muted-foreground font-semibold">Cargando nómina...</p>
              </div>
            ) : planillaList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/5 rounded-sm space-y-4 m-6 border border-dashed border-border/60">
                <FaClipboardList className="h-8 w-8 text-muted-foreground/60" />
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-tight">Roster Vacío</h4>
                  <p className="text-muted-foreground text-xs max-w-sm mt-0.5">
                    No has registrado deportistas en la planilla de este equipo todavía. Usa el formulario para inscribir los primeros.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <th className="text-left px-6 py-3">Deportista</th>
                      <th className="text-left px-6 py-3">Identificación</th>
                      <th className="text-center px-4 py-3">Género</th>
                      <th className="text-center px-4 py-3">Camiseta</th>
                      <th className="text-center px-6 py-3">Estado</th>
                      <th className="text-right px-6 py-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planillaList.map((p, idx) => (
                      <tr key={p.id || idx} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-3 font-bold uppercase text-xs tracking-tight text-foreground">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br shadow-sm uppercase",
                              getGradientBg(p.jugador?.nombre || "JG")
                            )}>
                              {getInitials(p.jugador?.nombre || "J", p.jugador?.apellidos || "G")}
                            </div>
                            <span className="truncate">
                              {p.jugador?.nombre} {p.jugador?.apellidos}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-xs text-muted-foreground">
                          {p.jugador?.identificacion || "—"}
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground uppercase">
                          {p.jugador?.genero || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-sm bg-primary/10 text-primary font-black text-xs">
                            {p.numeroCamiseta}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border-green-500/20">
                            {p.estado || "Activo"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Retirar de la Planilla"
                            onClick={() => handleEliminarPlanilla(p.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-sm"
                          >
                            <FaTrash className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
