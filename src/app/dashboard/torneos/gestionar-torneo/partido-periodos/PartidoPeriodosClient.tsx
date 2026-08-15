"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaArrowLeft,
  FaTrophy,
  FaCheckCircle,
  FaClock,
  FaSave,
  FaPlus,
  FaTrash,
  FaEdit,
  FaLock,
  FaTimes,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaCheck,
  FaUser,
  FaUsers,
  FaChartBar,
  FaSpinner,
} from "react-icons/fa";
import Link from "next/link";
import {
  getPeriodosPorPartido,
  createPartidoPeriodo,
  updatePartidoPeriodo,
  deletePartidoPeriodo,
} from "@/app/actions/partidoperiodos";
import { updatePartido } from "@/app/actions/partidos";
import {
  getTiposEstadisticaPorDeporte,
  registrarEstadistica,
  eliminarEstadistica,
  getEstadisticasPorPartido,
} from "@/app/actions/estadisticas";
import { getPlanillasPorTorneo } from "@/app/actions/planillas";
import { cn } from "@/lib/utils";
import { getUploadUrl } from "@/lib/uploads";

interface PartidoPeriodosClientProps {
  torneo: any;
  partido: any;
}

const REGULAR_PERIODS_BY_SPORT: Record<string, string[]> = {
  FUTBOL: ["Primer Tiempo", "Segundo Tiempo"],
  BALONCESTO: ["Cuarto 1", "Cuarto 2", "Cuarto 3", "Cuarto 4"],
  VOLEY: ["Set 1", "Set 2"],
};

const EXTRA_PERIODS_BY_SPORT: Record<string, string[]> = {
  FUTBOL: ["Tiempo Extra 1", "Tiempo Extra 2", "Penales"],
  BALONCESTO: ["Prórroga 1", "Prórroga 2", "Prórroga 3"],
  VOLEY: ["Set 3", "Set 4", "Set 5"],
};

export function PartidoPeriodosClient({ torneo, partido }: PartidoPeriodosClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Ref para auto-enfocar el primer input del periodo activo
  const activeInputRef = useRef<HTMLInputElement>(null);

  // Estados locales
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para Estadísticas por Jugador
  const [tiposEstadistica, setTiposEstadistica] = useState<any[]>([]);
  const [planillas, setPlanillas] = useState<any[]>([]);
  const [matchStats, setMatchStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsSuccess, setStatsSuccess] = useState<string | null>(null);
  const [playerInputs, setPlayerInputs] = useState<Record<number, { tipoId: string; cantidad: number }>>({});
  const [savingPlayerId, setSavingPlayerId] = useState<number | null>(null);
  const [deletingStatId, setDeletingStatId] = useState<number | null>(null);

  // Inputs para el periodo activo
  const [activeLocalScore, setActiveLocalScore] = useState<string>("");
  const [activeVisitanteScore, setActiveVisitanteScore] = useState<string>("");

  // Control de edición en línea
  const [editingPeriodId, setEditingPeriodId] = useState<number | null>(null);
  const [editingLocalScore, setEditingLocalScore] = useState<string>("");
  const [editingVisitanteScore, setEditingVisitanteScore] = useState<string>("");

  // Agregar periodo extra manualmente
  const [activeExtraPeriodName, setActiveExtraPeriodName] = useState<string | null>(null);

  // Determinar deporte
  const getDeporteKey = (deporte: string): string => {
    const d = deporte?.toLowerCase() || "";
    if (d.includes("futbol") || d.includes("fútbol") || d.includes("soccer")) return "FUTBOL";
    if (d.includes("basket") || d.includes("baloncesto")) return "BALONCESTO";
    if (d.includes("voley") || d.includes("voleibol")) return "VOLEY";
    return "BALONCESTO"; // Default
  };

  const deporteKey = getDeporteKey(torneo.deporte);
  const regularPeriodNames = REGULAR_PERIODS_BY_SPORT[deporteKey] || REGULAR_PERIODS_BY_SPORT.BALONCESTO;
  const extraPeriodNames = EXTRA_PERIODS_BY_SPORT[deporteKey] || EXTRA_PERIODS_BY_SPORT.BALONCESTO;

  const isVoley = deporteKey === "VOLEY";
  const savedRegularPeriodsCount = periodos.filter((p) => p.tipoPeriodo === "Regular").length;

  const [prevPartidoId, setPrevPartidoId] = useState(partido.id);
  if (partido.id !== prevPartidoId) {
    setPrevPartidoId(partido.id);
    setLoading(true);
  }

  // Cargar periodos del partido
  const loadPeriodos = async () => {
    try {
      const res = await getPeriodosPorPartido(partido.id);
      if (res.success && res.data) {
        setPeriodos(res.data);
      } else {
        setError(res.error || "No se pudieron obtener los periodos.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión al cargar los periodos.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas y planillas
  const loadEstadisticasData = async () => {
    try {
      setLoadingStats(true);
      const [tiposRes, planillasRes, statsRes] = await Promise.all([
        getTiposEstadisticaPorDeporte(torneo.deporte || ""),
        getPlanillasPorTorneo(Number(torneo.id)),
        getEstadisticasPorPartido(Number(partido.id)),
      ]);

      setTiposEstadistica(tiposRes || []);
      if (planillasRes && planillasRes.success && planillasRes.data) {
        setPlanillas(planillasRes.data);
      }
      setMatchStats(statsRes || []);
    } catch (err) {
      console.error("Error al cargar datos de estadísticas:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPeriodos();
    loadEstadisticasData();
  }, [partido.id, torneo.id, torneo.deporte]);

  const handleSavePlayerStat = async (jugadorId: number, equipoId: number) => {
    const input = playerInputs[jugadorId] || {
      tipoId: tiposEstadistica[0]?.id?.toString() || "",
      cantidad: 1,
    };

    const tipoIdNum = parseInt(input.tipoId || (tiposEstadistica[0]?.id?.toString() ?? ""), 10);
    const cantidadNum = Number(input.cantidad) > 0 ? Number(input.cantidad) : 1;

    if (!tipoIdNum || isNaN(tipoIdNum)) {
      setStatsError("Selecciona un tipo de estadística válido.");
      return;
    }

    setSavingPlayerId(jugadorId);
    setStatsError(null);
    setStatsSuccess(null);

    try {
      const res = await registrarEstadistica({
        jugadorId: Number(jugadorId),
        partidoId: Number(partido.id),
        equipoId: Number(equipoId),
        tipoEstadisticaId: tipoIdNum,
        cantidad: cantidadNum,
      });

      if (res.error) {
        setStatsError(res.error);
      } else {
        setStatsSuccess("Estadística guardada correctamente.");
        const updatedStats = await getEstadisticasPorPartido(Number(partido.id));
        setMatchStats(updatedStats || []);
        setPlayerInputs((prev) => ({
          ...prev,
          [jugadorId]: {
            ...prev[jugadorId],
            tipoId: input.tipoId,
            cantidad: 1,
          },
        }));
      }
    } catch (err) {
      console.error("Error al guardar estadística:", err);
      setStatsError("Error de conexión al registrar la estadística.");
    } finally {
      setSavingPlayerId(null);
    }
  };

  const handleDeletePlayerStat = async (statId: number) => {
    if (!confirm("¿Deseas eliminar este registro de estadística?")) return;

    setDeletingStatId(statId);
    setStatsError(null);
    setStatsSuccess(null);

    try {
      const res = await eliminarEstadistica(statId);
      if (res.error) {
        setStatsError(res.error);
      } else {
        setStatsSuccess("Estadística eliminada.");
        const updatedStats = await getEstadisticasPorPartido(Number(partido.id));
        setMatchStats(updatedStats || []);
      }
    } catch (err) {
      console.error("Error al eliminar estadística:", err);
      setStatsError("Error de conexión al eliminar.");
    } finally {
      setDeletingStatId(null);
    }
  };

  // Obtener iniciales del equipo
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

  // Mapear iconos por deporte
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

  // Encontrar qué periodos regulares ya están guardados
  const periodosGuardadosMap = new Map<string, any>();
  periodos.forEach((p) => {
    periodosGuardadosMap.set(p.nombrePeriodo, p);
  });

  // Determinar cuál es el primer periodo regular no guardado (activo)
  let primerPeriodoNoGuardado: string | null = null;
  if (!activeExtraPeriodName) {
    for (const name of regularPeriodNames) {
      if (!periodosGuardadosMap.has(name)) {
        primerPeriodoNoGuardado = name;
        break;
      }
    }
  }

  // Sumar marcadores en tiempo real (guardados + inputs activos)
  const calculateLiveScore = () => {
    let totalLocal = 0;
    let totalVisitante = 0;

    if (isVoley) {
      // Para voleibol, el marcador del partido son los sets ganados
      periodos.forEach((p) => {
        const scoreL = p.scoreLocal ?? 0;
        const scoreV = p.scoreVisitante ?? 0;
        if (scoreL > scoreV) totalLocal += 1;
        else if (scoreV > scoreL) totalVisitante += 1;
      });

      const activeLocalVal = parseInt(activeLocalScore, 10);
      const activeVisitanteVal = parseInt(activeVisitanteScore, 10);
      if (!isNaN(activeLocalVal) && !isNaN(activeVisitanteVal)) {
        if (activeLocalVal > activeVisitanteVal) totalLocal += 1;
        else if (activeVisitanteVal > activeLocalVal) totalVisitante += 1;
      }
    } else {
      // 1. Sumar periodos guardados
      periodos.forEach((p) => {
        totalLocal += p.scoreLocal ?? 0;
        totalVisitante += p.scoreVisitante ?? 0;
      });

      // 2. Sumar input del periodo activo actual (si el usuario está escribiendo)
      const activeLocalVal = parseInt(activeLocalScore, 10);
      const activeVisitanteVal = parseInt(activeVisitanteScore, 10);
      if (!isNaN(activeLocalVal)) totalLocal += activeLocalVal;
      if (!isNaN(activeVisitanteVal)) totalVisitante += activeVisitanteVal;
    }

    return { totalLocal, totalVisitante };
  };

  const { totalLocal, totalVisitante } = calculateLiveScore();

  // Modal de confirmación para finalizar encuentro
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Obtener marcador oficial final que se guardará
  const getFinalScore = () => {
    let finalLocal = 0;
    let finalVisitante = 0;
    if (isVoley) {
      periodos.forEach((p) => {
        const scoreL = p.scoreLocal ?? 0;
        const scoreV = p.scoreVisitante ?? 0;
        if (scoreL > scoreV) finalLocal += 1;
        else if (scoreV > scoreL) finalVisitante += 1;
      });
    } else {
      periodos.forEach((p) => {
        finalLocal += p.scoreLocal ?? 0;
        finalVisitante += p.scoreVisitante ?? 0;
      });
    }
    return { finalLocal, finalVisitante };
  };

  const { finalLocal, finalVisitante } = getFinalScore();

  // Calcular marcador solo del tiempo regular (para saber si hay empate)
  const isRegularTimeFinished = regularPeriodNames.every((name) => periodosGuardadosMap.has(name));
  const isRegularTimeTied = () => {
    if (!isRegularTimeFinished) return false;
    let regLocal = 0;
    let regVisitante = 0;
    regularPeriodNames.forEach((name) => {
      const p = periodosGuardadosMap.get(name);
      regLocal += p?.scoreLocal ?? 0;
      regVisitante += p?.scoreVisitante ?? 0;
    });
    return regLocal === regVisitante;
  };

  const hasTie = isRegularTimeTied();

  // Enfocar automáticamente el input del marcador local cuando el periodo cambia
  useEffect(() => {
    if (activeInputRef.current) {
      activeInputRef.current.focus();
    }
  }, [primerPeriodoNoGuardado, activeExtraPeriodName]);

  // Manejar el guardado rápido al presionar Enter en los inputs del marcador
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nombrePeriodo: string, tipoPeriodo: "Regular" | "Extra") => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveActivePeriod(nombrePeriodo, tipoPeriodo);
    }
  };

  // Determinar la prórroga sugerida
  const getNextExtraPeriodName = () => {
    const extraSavedCount = periodos.filter((p) => p.tipoPeriodo === "Extra").length;
    if (extraSavedCount < extraPeriodNames.length) {
      return extraPeriodNames[extraSavedCount];
    }
    return `Tiempo Extra ${extraSavedCount + 1}`;
  };

  // Crear un nuevo periodo (Guardar fila activa)
  const handleSaveActivePeriod = async (nombrePeriodo: string, tipoPeriodo: "Regular" | "Extra") => {
    setError(null);
    setSuccess(null);

    const localScoreNum = parseInt(activeLocalScore, 10);
    const visitanteScoreNum = parseInt(activeVisitanteScore, 10);

    if (isNaN(localScoreNum) || isNaN(visitanteScoreNum)) {
      setError("Por favor ingresa puntuaciones válidas para ambos equipos.");
      return;
    }

    if (localScoreNum < 0 || visitanteScoreNum < 0) {
      setError("Los marcadores no pueden ser negativos.");
      return;
    }

    startTransition(async () => {
      const res = await createPartidoPeriodo({
        idPartido: partido.id,
        nombrePeriodo,
        tipoPeriodo,
        scoreLocal: localScoreNum,
        scoreVisitante: visitanteScoreNum,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`¡${nombrePeriodo} registrado correctamente!`);
        setActiveLocalScore("");
        setActiveVisitanteScore("");
        setActiveExtraPeriodName(null);
        await loadPeriodos();
      }
    });
  };

  // Habilitar edición en línea de una fila guardada
  const startEditing = (periodo: any) => {
    setEditingPeriodId(periodo.id);
    setEditingLocalScore(periodo.scoreLocal.toString());
    setEditingVisitanteScore(periodo.scoreVisitante.toString());
    setError(null);
    setSuccess(null);
  };

  // Guardar edición en línea
  const handleUpdatePeriod = async (id: number) => {
    setError(null);
    setSuccess(null);

    const localScoreNum = parseInt(editingLocalScore, 10);
    const visitanteScoreNum = parseInt(editingVisitanteScore, 10);

    if (isNaN(localScoreNum) || isNaN(visitanteScoreNum)) {
      setError("Puntuaciones no válidas.");
      return;
    }

    startTransition(async () => {
      const res = await updatePartidoPeriodo(id, {
        scoreLocal: localScoreNum,
        scoreVisitante: visitanteScoreNum,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Periodo actualizado correctamente.");
        setEditingPeriodId(null);
        await loadPeriodos();
      }
    });
  };

  // Eliminar un periodo
  const handleDeletePeriod = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el registro de ${name}?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await deletePartidoPeriodo(id);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Se eliminó el registro de ${name}.`);
        await loadPeriodos();
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión al eliminar.");
    }
  };

  // Finalizar el encuentro oficial
  const handleFinalizeMatch = async () => {
    setError(null);
    setSuccess(null);
    setIsConfirmModalOpen(false);

    startTransition(async () => {
      // 1. Obtener la sumatoria real de los periodos guardados
      let finalLocal = 0;
      let finalVisitante = 0;

      if (isVoley) {
        // Para voleibol, el marcador final es el número de sets ganados
        periodos.forEach((p) => {
          const scoreL = p.scoreLocal ?? 0;
          const scoreV = p.scoreVisitante ?? 0;
          if (scoreL > scoreV) finalLocal += 1;
          else if (scoreV > scoreL) finalVisitante += 1;
        });
      } else {
        periodos.forEach((p) => {
          finalLocal += p.scoreLocal ?? 0;
          finalVisitante += p.scoreVisitante ?? 0;
        });
      }

      // 2. Llamar PATCH /partidos/:id para cambiar a Finalizado con los marcadores consolidados
      const res = await updatePartido(partido.id, {
        local: finalLocal,
        visitante: finalVisitante,
        estado: "Finalizado",
      });

      if (res.error) {
        setError(res.error);
      } else {
        router.push(`/dashboard/torneos/gestionar-torneo?id=${torneo.id}&tab=partidos`);
        router.refresh();
      }
    });
  };

  const localEquipoId = Number(partido.equipoLocal?.id);
  const visitanteEquipoId = Number(partido.equipoVisitante?.id);

  const localPlanillas = planillas.filter(
    (p: any) => Number(p.equipo?.id || p.equipoId) === localEquipoId
  );
  const visitantePlanillas = planillas.filter(
    (p: any) => Number(p.equipo?.id || p.equipoId) === visitanteEquipoId
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Cabecera / Volver */}
      <div>
        <Link
          href={`/dashboard/torneos/gestionar-torneo?id=${torneo.id}&tab=partidos`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-3"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Gestión de Torneo
        </Link>

        {/* Torneo Banner */}
        <div className="bg-[oklch(0.25_0.05_255)] text-white border border-white/10 px-5 py-3.5 rounded-sm flex items-center justify-between shadow-md mb-6">
          <div className="flex items-center gap-2">
            <FaTrophy className="text-primary h-5 w-5 animate-pulse" />
            <span className="text-sm font-black uppercase tracking-wider">
              [ Torneo: {torneo.name} - {torneo.deporte} ]
            </span>
          </div>
          <span className="text-[10px] bg-primary/20 border border-primary/30 text-primary font-black px-2.5 py-1 rounded-sm uppercase tracking-widest">
            Categoría {torneo.rama}
          </span>
        </div>

        {/* Marcador Cabecera (Resumen del Partido) */}
        <Card className="border border-border/60 shadow-md relative overflow-hidden bg-card">
          {/* Fondo decorativo con marca */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <CardHeader className="border-b border-border/40 bg-muted/10 py-3">
            <CardTitle className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Cabecera (Resumen del Partido)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Equipo Local */}
              <div className="flex flex-col md:flex-row items-center gap-4 flex-1 justify-end w-full">
                <span className="text-base font-extrabold uppercase tracking-tight text-foreground text-center md:text-right order-2 md:order-1">
                  {partido.equipoLocal?.nombre || "Equipo Local"}
                </span>
                <div className="order-1 md:order-2">
                  {partido.equipoLocal?.foto ? (
                    <img
                      src={getUploadUrl("equipos", partido.equipoLocal.foto)}
                      alt={partido.equipoLocal.nombre}
                      className="h-16 w-16 rounded-full object-cover border border-border/60 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className={cn(
                      "h-16 w-16 rounded-full shrink-0 flex items-center justify-center text-lg font-black text-white bg-gradient-to-br shadow-sm uppercase",
                      getGradientBg(partido.equipoLocal?.nombre || "LC")
                    )}>
                      {getInitials(partido.equipoLocal?.nombre || "LC")}
                    </div>
                  )}
                </div>
              </div>

              {/* Marcador Gigante */}
              <div className="flex items-center gap-5 justify-center shrink-0">
                <span className="text-6xl font-black tabular-nums tracking-wider text-sky-400 select-none drop-shadow-sm font-mono">
                  {totalLocal}
                </span>
                <span className="text-3xl font-black text-muted-foreground/40 font-mono">|</span>
                <span className="text-6xl font-black tabular-nums tracking-wider text-primary select-none drop-shadow-sm font-mono">
                  {totalVisitante}
                </span>
              </div>

              {/* Equipo Visitante */}
              <div className="flex flex-col md:flex-row items-center gap-4 flex-1 justify-start w-full">
                <div>
                  {partido.equipoVisitante?.foto ? (
                    <img
                      src={getUploadUrl("equipos", partido.equipoVisitante.foto)}
                      alt={partido.equipoVisitante.nombre}
                      className="h-16 w-16 rounded-full object-cover border border-border/60 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className={cn(
                      "h-16 w-16 rounded-full shrink-0 flex items-center justify-center text-lg font-black text-white bg-gradient-to-br shadow-sm uppercase",
                      getGradientBg(partido.equipoVisitante?.nombre || "VT")
                    )}>
                      {getInitials(partido.equipoVisitante?.nombre || "VT")}
                    </div>
                  )}
                </div>
                <span className="text-base font-extrabold uppercase tracking-tight text-foreground text-center md:text-left">
                  {partido.equipoVisitante?.nombre || "Equipo Visitante"}
                </span>
              </div>
            </div>

            {/* Estado del Partido */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-muted/40 border border-border/60 rounded-sm shadow-sm text-xs font-bold text-foreground">
                <span>Estado del Partido:</span>
                {partido.estado === "Finalizado" ? (
                  <span className="text-muted-foreground flex items-center gap-1 uppercase text-[10px] font-black">
                    [ FINALIZADO 🏁 ]
                  </span>
                ) : (
                  <span className="text-green-500 flex items-center gap-1 uppercase text-[10px] font-black animate-pulse">
                    [ EN VIVO 🟢 ]
                  </span>
                )}
                {periodos.length > 0 && (
                  <span className="text-muted-foreground">
                    ({periodos[periodos.length - 1]?.nombrePeriodo})
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 mt-1">
                <FaClock className="h-3 w-3" />
                <span>Programado: {partido.fecha} a las {partido.hora.slice(0, 5)} en {partido.escenario?.nombre || "Por definir"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Feedback */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/25 text-destructive rounded-sm text-center text-xs font-bold leading-normal">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/25 text-green-500 rounded-sm text-center text-xs font-bold flex items-center justify-center gap-2">
          <FaCheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Control de Periodos Dinámico */}
      <Card className="border border-border/60 shadow-md">
        <CardHeader className="border-b border-border/50 bg-muted/15 py-4">
          <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
            <FaClock className="text-primary h-4.5 w-4.5" />
            Control de Periodos (Dinámico)
          </CardTitle>
          <CardDescription className="text-xs">
            Ingresa y bloquea los puntajes correspondientes a cada sección del partido.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="text-left px-6 py-3.5 w-1/4">Periodo</th>
                  <th className="text-center px-6 py-3.5 w-1/4">Local ({partido.equipoLocal?.nombre?.split(" ")[0]})</th>
                  <th className="text-center px-6 py-3.5 w-1/4">Visitante ({partido.equipoVisitante?.nombre?.split(" ")[0]})</th>
                  <th className="text-right px-6 py-3.5 w-1/4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. RENDERIZAR TODOS LOS PERIODOS REGULARES */}
                {regularPeriodNames.map((name) => {
                  const saved = periodosGuardadosMap.get(name);
                  const isActive = primerPeriodoNoGuardado === name && !editingPeriodId && partido.estado !== "Finalizado";
                  const isEditing = editingPeriodId === saved?.id;

                  return (
                    <tr
                      key={name}
                      className={cn(
                        "border-b border-border/40 transition-colors",
                        isActive && "bg-primary/5 border-l-4 border-l-primary/75 animate-fadeIn",
                        isEditing && "bg-sky-500/5"
                      )}
                    >
                      {/* Nombre Periodo */}
                      <td className="px-6 py-3.5 font-bold uppercase text-xs tracking-tight text-foreground">
                        {name}
                      </td>

                      {/* Score Local */}
                      <td className="px-6 py-3.5 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-bold text-muted-foreground">[</span>
                            <input
                              type="number"
                              min="0"
                              value={editingLocalScore}
                              onChange={(e) => setEditingLocalScore(e.target.value)}
                              className="w-16 h-8 bg-card border border-border/60 rounded-sm text-center text-sm font-black text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                            />
                            <span className="text-sm font-bold text-muted-foreground">]</span>
                          </div>
                        ) : isActive ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-bold text-sky-400">[</span>
                            <input
                              ref={activeInputRef}
                              type="number"
                              min="0"
                              value={activeLocalScore}
                              onChange={(e) => {
                                setActiveLocalScore(e.target.value);
                                setError(null);
                              }}
                              onKeyDown={(e) => handleKeyDown(e, name, "Regular")}
                              className="w-16 h-8 bg-card border border-sky-400/50 rounded-sm text-center text-sm font-black text-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 font-mono"
                              placeholder="0"
                            />
                            <span className="text-sm font-bold text-sky-400">]</span>
                          </div>
                        ) : saved ? (
                          <span className="text-base font-black text-sky-400 font-mono select-none px-2 border-x-2 border-sky-400/30">
                            [ {saved.scoreLocal} ]
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic font-semibold">Pendiente</span>
                        )}
                      </td>

                      {/* Score Visitante */}
                      <td className="px-6 py-3.5 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-bold text-muted-foreground">[</span>
                            <input
                              type="number"
                              min="0"
                              value={editingVisitanteScore}
                              onChange={(e) => setEditingVisitanteScore(e.target.value)}
                              className="w-16 h-8 bg-card border border-border/60 rounded-sm text-center text-sm font-black text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                            />
                            <span className="text-sm font-bold text-muted-foreground">]</span>
                          </div>
                        ) : isActive ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-bold text-primary">[</span>
                            <input
                              type="number"
                              min="0"
                              value={activeVisitanteScore}
                              onChange={(e) => {
                                setActiveVisitanteScore(e.target.value);
                                setError(null);
                              }}
                              onKeyDown={(e) => handleKeyDown(e, name, "Regular")}
                              className="w-16 h-8 bg-card border border-primary/50 rounded-sm text-center text-sm font-black text-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                              placeholder="0"
                            />
                            <span className="text-sm font-bold text-primary">]</span>
                          </div>
                        ) : saved ? (
                          <span className="text-base font-black text-primary font-mono select-none px-2 border-x-2 border-primary/30">
                            [ {saved.scoreVisitante} ]
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic font-semibold">Pendiente</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-3.5 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1.5">
                            <Button
                              onClick={() => handleUpdatePeriod(saved.id)}
                              size="sm"
                              className="h-7 px-2.5 rounded-sm bg-green-600 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 hover:bg-green-600/90"
                            >
                              <FaCheck className="h-2.5 w-2.5" /> Guardar
                            </Button>
                            <Button
                              onClick={() => setEditingPeriodId(null)}
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2.5 rounded-sm border border-border/60 font-bold text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"
                            >
                              <FaTimes className="h-2.5 w-2.5" /> Cancelar
                            </Button>
                          </div>
                        ) : isActive ? (
                          <Button
                            onClick={() => handleSaveActivePeriod(name, "Regular")}
                            disabled={isPending}
                            className="h-8 px-4 rounded-sm bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-emerald-500/95"
                          >
                            <FaSave className="h-3 w-3" /> [Guardar]
                          </Button>
                        ) : saved ? (
                          <div className="flex items-center justify-end gap-2.5 text-xs text-muted-foreground font-semibold">
                            <span className="flex items-center gap-1 uppercase text-[9px] font-bold text-muted-foreground/75 bg-muted border border-border/80 px-2 py-0.5 rounded-sm select-none">
                              <FaLock className="h-2.5 w-2.5" /> Guardado
                            </span>
                            {partido.estado !== "Finalizado" && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditing(saved)}
                                  className="h-7 w-7 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300 rounded-sm"
                                  title="Editar periodo"
                                >
                                  <FaEdit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeletePeriod(saved.id, name)}
                                  className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-sm"
                                  title="Eliminar registro"
                                >
                                  <FaTrash className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block pr-2.5 select-none">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* 2. RENDERIZAR TODOS LOS PERIODOS EXTRAS YA GUARDADOS EN LA BD */}
                {periodos
                  .filter((p) => p.tipoPeriodo === "Extra")
                  .map((saved) => {
                    const isEditing = editingPeriodId === saved.id;
                    return (
                      <tr
                        key={saved.id}
                        className={cn(
                          "border-b border-border/40 bg-emerald-500/5 border-l-4 border-l-emerald-500/50 transition-colors",
                          isEditing && "bg-sky-500/5"
                        )}
                      >
                        {/* Nombre Periodo Extra */}
                        <td className="px-6 py-3.5 font-bold uppercase text-xs tracking-tight text-emerald-500">
                          {saved.nombrePeriodo}
                        </td>

                        {/* Score Local Extra */}
                        <td className="px-6 py-3.5 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-sm font-bold text-muted-foreground">[</span>
                              <input
                                type="number"
                                min="0"
                                value={editingLocalScore}
                                onChange={(e) => setEditingLocalScore(e.target.value)}
                                className="w-16 h-8 bg-card border border-border/60 rounded-sm text-center text-sm font-black text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                              />
                              <span className="text-sm font-bold text-muted-foreground">]</span>
                            </div>
                          ) : (
                            <span className="text-base font-black text-emerald-500 font-mono select-none px-2 border-x-2 border-emerald-500/30">
                              [ {saved.scoreLocal} ]
                            </span>
                          )}
                        </td>

                        {/* Score Visitante Extra */}
                        <td className="px-6 py-3.5 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-sm font-bold text-muted-foreground">[</span>
                              <input
                                type="number"
                                min="0"
                                value={editingVisitanteScore}
                                onChange={(e) => setEditingVisitanteScore(e.target.value)}
                                className="w-16 h-8 bg-card border border-border/60 rounded-sm text-center text-sm font-black text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                              />
                              <span className="text-sm font-bold text-muted-foreground">]</span>
                            </div>
                          ) : (
                            <span className="text-base font-black text-emerald-500 font-mono select-none px-2 border-x-2 border-emerald-500/30">
                              [ {saved.scoreVisitante} ]
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-3.5 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                onClick={() => handleUpdatePeriod(saved.id)}
                                size="sm"
                                className="h-7 px-2.5 rounded-sm bg-green-600 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 hover:bg-green-600/90"
                              >
                                <FaCheck className="h-2.5 w-2.5" /> Guardar
                              </Button>
                              <Button
                                onClick={() => setEditingPeriodId(null)}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2.5 rounded-sm border border-border/60 font-bold text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"
                              >
                                <FaTimes className="h-2.5 w-2.5" /> Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2.5 text-xs text-muted-foreground font-semibold">
                              <span className="flex items-center gap-1 uppercase text-[9px] font-bold text-emerald-500/75 bg-emerald-500/5 border border-emerald-500/25 px-2 py-0.5 rounded-sm select-none">
                                <FaLock className="h-2.5 w-2.5" /> Guardado
                              </span>
                              {partido.estado !== "Finalizado" && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEditing(saved)}
                                    className="h-7 w-7 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300 rounded-sm"
                                    title="Editar periodo"
                                  >
                                    <FaEdit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeletePeriod(saved.id, saved.nombrePeriodo)}
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-sm"
                                    title="Eliminar registro"
                                  >
                                    <FaTrash className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                {/* 3. ALERTA DE EMPATE EN TIEMPO REGULAR Y FOTO DEL SCORE EXTRA ACTIVO */}
                {((isRegularTimeFinished && hasTie && (deporteKey === "BALONCESTO" || deporteKey === "FUTBOL")) || (isVoley && !!activeExtraPeriodName)) && (
                  <>
                    {/* Alerta de Empate (No aplica a Voleibol) */}
                    {!isVoley && (
                      <tr className="bg-primary/5 select-none">
                        <td colSpan={4} className="px-6 py-2.5 text-center text-xs font-bold text-primary tracking-wide border-b border-border/40">
                          * ¡Empate detectado en tiempo regular! *
                        </td>
                      </tr>
                    )}

                    {/* Fila Editable de Periodo Extra Activo */}
                    {activeExtraPeriodName && (
                      <tr className="border-b border-border/40 bg-emerald-500/5 border-l-4 border-l-emerald-500/80 animate-fadeIn">
                        <td className="px-6 py-3.5 font-bold uppercase text-xs tracking-tight text-emerald-500">
                          {activeExtraPeriodName}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-bold text-emerald-500">[</span>
                            <input
                              ref={activeInputRef}
                              type="number"
                              min="0"
                              value={activeLocalScore}
                              onChange={(e) => {
                                setActiveLocalScore(e.target.value);
                                setError(null);
                              }}
                              onKeyDown={(e) => handleKeyDown(e, activeExtraPeriodName || "", "Extra")}
                              className="w-16 h-8 bg-card border border-emerald-500/50 rounded-sm text-center text-sm font-black text-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                              placeholder="0"
                            />
                            <span className="text-sm font-bold text-emerald-500">]</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-bold text-emerald-500">[</span>
                            <input
                              type="number"
                              min="0"
                              value={activeVisitanteScore}
                              onChange={(e) => {
                                setActiveVisitanteScore(e.target.value);
                                setError(null);
                              }}
                              onKeyDown={(e) => handleKeyDown(e, activeExtraPeriodName || "", "Extra")}
                              className="w-16 h-8 bg-card border border-emerald-500/50 rounded-sm text-center text-sm font-black text-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                              placeholder="0"
                            />
                            <span className="text-sm font-bold text-emerald-500">]</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              onClick={() => handleSaveActivePeriod(activeExtraPeriodName, "Extra")}
                              disabled={isPending}
                              className="h-8 px-4 rounded-sm bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-emerald-500/95"
                            >
                              <FaSave className="h-3 w-3" /> [Guardar]
                            </Button>
                            <Button
                              onClick={() => {
                                setActiveExtraPeriodName(null);
                                setActiveLocalScore("");
                                setActiveVisitanteScore("");
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 rounded-sm border border-border/60 font-bold text-[9px] uppercase tracking-wider text-muted-foreground hover:bg-muted/10"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sección: Estadísticas por Jugador */}
      <Card className="border border-border/60 shadow-md">
        <CardHeader className="border-b border-border/50 bg-muted/15 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <FaChartBar className="text-primary h-4.5 w-4.5" />
                Estadísticas por Jugador
              </CardTitle>
              <CardDescription className="text-xs">
                Registra y gestiona las estadísticas individuales (puntos, goles, faltas, etc.) de cada jugador para este partido.
              </CardDescription>
            </div>
            {tiposEstadistica.length > 0 && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-primary/10 text-primary border border-primary/20 w-fit">
                {tiposEstadistica.length} {tiposEstadistica.length === 1 ? "Tipo Disponible" : "Tipos Disponibles"}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {statsError && (
            <div className="p-3 bg-destructive/10 border border-destructive/25 text-destructive rounded-sm text-xs font-bold flex items-center justify-between">
              <span>{statsError}</span>
              <button
                type="button"
                onClick={() => setStatsError(null)}
                className="text-destructive/70 hover:text-destructive text-sm ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          {statsSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/25 text-green-500 rounded-sm text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FaCheck className="h-3.5 w-3.5" /> {statsSuccess}
              </span>
              <button
                type="button"
                onClick={() => setStatsSuccess(null)}
                className="text-green-500/70 hover:text-green-500 text-sm ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {loadingStats ? (
            <div className="p-12 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin h-4 w-4 text-primary" />
              Cargando planillas y estadísticas...
            </div>
          ) : tiposEstadistica.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-muted-foreground bg-muted/20 border border-border/40 rounded-sm">
              No hay tipos de estadística configurados en el catálogo para el deporte &ldquo;{torneo.deporte}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna Equipo Local */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/60 rounded-sm">
                  {partido.equipoLocal?.logoUrl || partido.equipoLocal?.foto ? (
                    <img
                      src={getUploadUrl("equipos", partido.equipoLocal.foto || partido.equipoLocal.logoUrl)}
                      alt={partido.equipoLocal.nombre}
                      className="h-8 w-8 rounded-full object-cover border border-border/60 shadow-sm shrink-0"
                    />
                  ) : (
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-white bg-gradient-to-br shadow-sm uppercase",
                        getGradientBg(partido.equipoLocal?.nombre || "L")
                      )}
                    >
                      {getInitials(partido.equipoLocal?.nombre || "L")}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">
                      Equipo Local
                    </span>
                    <h4 className="text-xs font-black uppercase tracking-tight text-foreground truncate">
                      {partido.equipoLocal?.nombre || "Local"}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground bg-card border border-border/60 px-2 py-0.5 rounded-sm">
                    {localPlanillas.length} {localPlanillas.length === 1 ? "jugador" : "jugadores"}
                  </span>
                </div>

                {localPlanillas.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground italic border border-dashed border-border/60 rounded-sm">
                    No hay jugadores inscritos en la planilla de este equipo.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {localPlanillas.map((p: any) => {
                      const jugador = p.jugador || {};
                      const jId = Number(jugador.id || p.idJugador || p.jugadorId);
                      const jNombre =
                        `${jugador.nombres || jugador.nombre || ""} ${jugador.apellidos || jugador.apellido || ""}`.trim() ||
                        `Jugador #${jId}`;
                      const statGroup = matchStats.find((s: any) => Number(s.jugador?.id) === jId);
                      const playerStatsList = statGroup?.estadisticas || [];
                      const playerTotal = statGroup?.totalPuntos;
                      const currentInput = playerInputs[jId] || {
                        tipoId: tiposEstadistica[0]?.id?.toString() || "",
                        cantidad: 1,
                      };

                      return (
                        <div
                          key={p.id || jId}
                          className="bg-card border border-border/60 rounded-sm p-3.5 hover:border-primary/40 transition-colors shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  "h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br shadow-xs uppercase",
                                  getGradientBg(jNombre)
                                )}
                              >
                                {getInitials(jNombre)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-foreground truncate uppercase">
                                  {p.numeroCamiseta ? (
                                    <span className="text-primary font-mono mr-1.5 font-bold">
                                      #{p.numeroCamiseta}
                                    </span>
                                  ) : null}
                                  {jNombre}
                                </p>
                              </div>
                            </div>
                            {playerTotal !== undefined && playerTotal > 0 && (
                              <span className="text-[10px] font-black uppercase text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm shrink-0">
                                {playerTotal} pts
                              </span>
                            )}
                          </div>

                          {/* Formulario Inline */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/30">
                            <select
                              value={currentInput.tipoId}
                              onChange={(e) =>
                                setPlayerInputs((prev) => ({
                                  ...prev,
                                  [jId]: {
                                    tipoId: e.target.value,
                                    cantidad: prev[jId]?.cantidad ?? 1,
                                  },
                                }))
                              }
                              className="h-8 flex-1 min-w-[140px] bg-muted/40 border border-border/60 rounded-sm px-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {tiposEstadistica.map((t: any) => (
                                <option key={t.id} value={t.id}>
                                  {t.nombre} {t.puntos ? `(${t.puntos > 0 ? `+${t.puntos}` : t.puntos} pts)` : ""}
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              min="1"
                              value={currentInput.cantidad}
                              onChange={(e) =>
                                setPlayerInputs((prev) => ({
                                  ...prev,
                                  [jId]: {
                                    tipoId: prev[jId]?.tipoId ?? (tiposEstadistica[0]?.id?.toString() || ""),
                                    cantidad: parseInt(e.target.value, 10) || 1,
                                  },
                                }))
                              }
                              className="w-14 h-8 bg-card border border-border/60 rounded-sm text-center text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                              title="Cantidad"
                            />

                            <Button
                              type="button"
                              size="sm"
                              disabled={savingPlayerId === jId}
                              onClick={() => handleSavePlayerStat(jId, localEquipoId)}
                              className="h-8 px-3 rounded-sm bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider hover:bg-primary/90 shrink-0"
                            >
                              {savingPlayerId === jId ? (
                                <FaSpinner className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <FaPlus className="h-2.5 w-2.5 mr-1" />
                                  Guardar
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Estadísticas Registradas */}
                          {playerStatsList.length > 0 && (
                            <div className="pt-2 border-t border-border/30 flex flex-wrap items-center gap-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                                Registros:
                              </span>
                              {playerStatsList.map((st: any, sIdx: number) => {
                                const statName =
                                  typeof st.tipo === "object"
                                    ? st.tipo?.nombre
                                    : st.tipo || st.tipoEstadistica?.nombre || st.nombre || "Estadística";
                                return (
                                  <span
                                    key={st.id || sIdx}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted/60 border border-border/50 text-[11px] font-semibold text-foreground shadow-2xs"
                                  >
                                    <span>
                                      {statName}: <strong className="text-primary font-mono">{st.cantidad}</strong>
                                      {st.puntos !== undefined && st.puntos !== null ? (
                                        <span className="text-[10px] text-muted-foreground ml-0.5">
                                          ({st.puntos} pts)
                                        </span>
                                      ) : null}
                                    </span>
                                    {st.id && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePlayerStat(st.id)}
                                        disabled={deletingStatId === st.id}
                                        title="Eliminar estadística"
                                        className="text-muted-foreground hover:text-destructive p-0.5 transition-colors cursor-pointer"
                                      >
                                        {deletingStatId === st.id ? (
                                          <FaSpinner className="h-2.5 w-2.5 animate-spin text-destructive" />
                                        ) : (
                                          <FaTrash className="h-2.5 w-2.5" />
                                        )}
                                      </button>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Columna Equipo Visitante */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/60 rounded-sm">
                  {partido.equipoVisitante?.logoUrl || partido.equipoVisitante?.foto ? (
                    <img
                      src={getUploadUrl("equipos", partido.equipoVisitante.foto || partido.equipoVisitante.logoUrl)}
                      alt={partido.equipoVisitante.nombre}
                      className="h-8 w-8 rounded-full object-cover border border-border/60 shadow-sm shrink-0"
                    />
                  ) : (
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-white bg-gradient-to-br shadow-sm uppercase",
                        getGradientBg(partido.equipoVisitante?.nombre || "V")
                      )}
                    >
                      {getInitials(partido.equipoVisitante?.nombre || "V")}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                      Equipo Visitante
                    </span>
                    <h4 className="text-xs font-black uppercase tracking-tight text-foreground truncate">
                      {partido.equipoVisitante?.nombre || "Visitante"}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground bg-card border border-border/60 px-2 py-0.5 rounded-sm">
                    {visitantePlanillas.length} {visitantePlanillas.length === 1 ? "jugador" : "jugadores"}
                  </span>
                </div>

                {visitantePlanillas.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground italic border border-dashed border-border/60 rounded-sm">
                    No hay jugadores inscritos en la planilla de este equipo.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visitantePlanillas.map((p: any) => {
                      const jugador = p.jugador || {};
                      const jId = Number(jugador.id || p.idJugador || p.jugadorId);
                      const jNombre =
                        `${jugador.nombres || jugador.nombre || ""} ${jugador.apellidos || jugador.apellido || ""}`.trim() ||
                        `Jugador #${jId}`;
                      const statGroup = matchStats.find((s: any) => Number(s.jugador?.id) === jId);
                      const playerStatsList = statGroup?.estadisticas || [];
                      const playerTotal = statGroup?.totalPuntos;
                      const currentInput = playerInputs[jId] || {
                        tipoId: tiposEstadistica[0]?.id?.toString() || "",
                        cantidad: 1,
                      };

                      return (
                        <div
                          key={p.id || jId}
                          className="bg-card border border-border/60 rounded-sm p-3.5 hover:border-primary/40 transition-colors shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  "h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br shadow-xs uppercase",
                                  getGradientBg(jNombre)
                                )}
                              >
                                {getInitials(jNombre)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-foreground truncate uppercase">
                                  {p.numeroCamiseta ? (
                                    <span className="text-primary font-mono mr-1.5 font-bold">
                                      #{p.numeroCamiseta}
                                    </span>
                                  ) : null}
                                  {jNombre}
                                </p>
                              </div>
                            </div>
                            {playerTotal !== undefined && playerTotal > 0 && (
                              <span className="text-[10px] font-black uppercase text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm shrink-0">
                                {playerTotal} pts
                              </span>
                            )}
                          </div>

                          {/* Formulario Inline */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/30">
                            <select
                              value={currentInput.tipoId}
                              onChange={(e) =>
                                setPlayerInputs((prev) => ({
                                  ...prev,
                                  [jId]: {
                                    tipoId: e.target.value,
                                    cantidad: prev[jId]?.cantidad ?? 1,
                                  },
                                }))
                              }
                              className="h-8 flex-1 min-w-[140px] bg-muted/40 border border-border/60 rounded-sm px-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {tiposEstadistica.map((t: any) => (
                                <option key={t.id} value={t.id}>
                                  {t.nombre} {t.puntos ? `(${t.puntos > 0 ? `+${t.puntos}` : t.puntos} pts)` : ""}
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              min="1"
                              value={currentInput.cantidad}
                              onChange={(e) =>
                                setPlayerInputs((prev) => ({
                                  ...prev,
                                  [jId]: {
                                    tipoId: prev[jId]?.tipoId ?? (tiposEstadistica[0]?.id?.toString() || ""),
                                    cantidad: parseInt(e.target.value, 10) || 1,
                                  },
                                }))
                              }
                              className="w-14 h-8 bg-card border border-border/60 rounded-sm text-center text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                              title="Cantidad"
                            />

                            <Button
                              type="button"
                              size="sm"
                              disabled={savingPlayerId === jId}
                              onClick={() => handleSavePlayerStat(jId, visitanteEquipoId)}
                              className="h-8 px-3 rounded-sm bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider hover:bg-primary/90 shrink-0"
                            >
                              {savingPlayerId === jId ? (
                                <FaSpinner className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <FaPlus className="h-2.5 w-2.5 mr-1" />
                                  Guardar
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Estadísticas Registradas */}
                          {playerStatsList.length > 0 && (
                            <div className="pt-2 border-t border-border/30 flex flex-wrap items-center gap-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                                Registros:
                              </span>
                              {playerStatsList.map((st: any, sIdx: number) => {
                                const statName =
                                  typeof st.tipo === "object"
                                    ? st.tipo?.nombre
                                    : st.tipo || st.tipoEstadistica?.nombre || st.nombre || "Estadística";
                                return (
                                  <span
                                    key={st.id || sIdx}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted/60 border border-border/50 text-[11px] font-semibold text-foreground shadow-2xs"
                                  >
                                    <span>
                                      {statName}: <strong className="text-primary font-mono">{st.cantidad}</strong>
                                      {st.puntos !== undefined && st.puntos !== null ? (
                                        <span className="text-[10px] text-muted-foreground ml-0.5">
                                          ({st.puntos} pts)
                                        </span>
                                      ) : null}
                                    </span>
                                    {st.id && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePlayerStat(st.id)}
                                        disabled={deletingStatId === st.id}
                                        title="Eliminar estadística"
                                        className="text-muted-foreground hover:text-destructive p-0.5 transition-colors cursor-pointer"
                                      >
                                        {deletingStatId === st.id ? (
                                          <FaSpinner className="h-2.5 w-2.5 animate-spin text-destructive" />
                                        ) : (
                                          <FaTrash className="h-2.5 w-2.5" />
                                        )}
                                      </button>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de Acción (Tiempo Extra / Finalizar Encuentro) */}
      {partido.estado !== "Finalizado" && (
        <div className="space-y-4">
          {/* Botón Agregar Tiempo Extra */}
          {isRegularTimeFinished && !activeExtraPeriodName && (!isVoley || periodos.length < 5) && (
            <Button
              onClick={() => {
                setActiveExtraPeriodName(getNextExtraPeriodName());
                setActiveLocalScore("");
                setActiveVisitanteScore("");
                setError(null);
              }}
              variant="outline"
              className="w-full font-bold h-12 rounded-sm border-primary text-primary hover:bg-primary/5 uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all duration-200"
            >
              <FaPlus className="h-3.5 w-3.5" />
              {isVoley ? "[ + Agregar Set Adicional ]" : "[ + Agregar Tiempo Extra ]"}
            </Button>
          )}

          {/* Botón Finalizar Encuentro Oficial */}
          <Button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={isPending || !!activeExtraPeriodName || !!primerPeriodoNoGuardado || (isVoley && finalLocal === finalVisitante)}
            className="w-full font-black h-14 rounded-sm bg-slate-900 border border-white/10 text-white hover:bg-slate-800 uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 shadow-lg group relative overflow-hidden"
          >
            <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary group-hover:w-2 transition-all" />
            <span>[ 🏁 FINALIZAR ENCUENTRO OFICIAL ]</span>
          </Button>

          <p className="text-center text-[10px] text-muted-foreground/80 italic font-semibold">
            (Al hacer clic, se cerrará el partido y se actualizará la tabla de posiciones)
          </p>
        </div>
      )}

      {/* Modal de confirmación para finalizar encuentro */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-border/60 p-5 bg-muted/15">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <FaCheckCircle className="text-primary" />
                  Finalizar Encuentro
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Confirma la finalización oficial del partido.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-sm text-sm"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                ¿Estás seguro de que deseas finalizar este encuentro? Esta acción guardará el siguiente marcador oficial en el sistema y actualizará la tabla de posiciones del torneo.
              </p>

              <div className="flex items-center justify-between gap-4 p-4 bg-[oklch(0.25_0.05_255)] text-white border border-white/10 rounded-sm">
                <div className="flex flex-col items-center flex-1 text-center">
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">Local</span>
                  <span className="text-xs font-black uppercase tracking-tight mt-1 line-clamp-1">
                    {partido.equipoLocal?.nombre || "Local"}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 px-3 py-1.5 bg-primary text-primary-foreground font-mono font-black text-lg rounded-sm shadow-md">
                  <span>{finalLocal}</span>
                  <span className="text-xs opacity-70">-</span>
                  <span>{finalVisitante}</span>
                </div>

                <div className="flex flex-col items-center flex-1 text-center">
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Visitante</span>
                  <span className="text-xs font-black uppercase tracking-tight mt-1 line-clamp-1">
                    {partido.equipoVisitante?.nombre || "Visitante"}
                  </span>
                </div>
              </div>

              {isVoley && (
                <p className="text-[10px] text-primary/80 bg-primary/5 border border-primary/15 p-2 rounded-sm font-semibold text-center uppercase tracking-wider">
                  * Marcador consolidado en Sets Ganados (Voleibol) *
                </p>
              )}

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 font-bold rounded-sm text-xs uppercase tracking-wider"
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleFinalizeMatch}
                  className="flex-1 h-12 font-black rounded-sm bg-slate-900 border border-white/10 text-white hover:bg-slate-800 uppercase tracking-widest text-[11px]"
                  disabled={isPending}
                >
                  {isPending ? "Procesando..." : "Sí, Finalizar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
