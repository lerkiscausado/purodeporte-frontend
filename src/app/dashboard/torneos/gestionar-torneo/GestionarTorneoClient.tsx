"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateTorneo } from "@/app/actions/torneos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FaArrowLeft,
  FaTrophy,
  FaCalendarAlt,
  FaDownload,
  FaUsers,
  FaUser,
  FaMapMarkerAlt,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaShieldAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaTrash,
  FaClipboardList,
  FaEdit,
} from "react-icons/fa";
import { DatePickerStrip } from "@/components/DatePickerStrip";
import { getInscripcionesPorTorneo, deleteInscripcion } from "@/app/actions/inscripciones";
import { cn } from "@/lib/utils";

interface GestionarTorneoClientProps {
  torneo: any;
  partidos: any[];
  baseUrl: string;
}

export function GestionarTorneoClient({ torneo, partidos, baseUrl }: GestionarTorneoClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isFutbol = torneo.deporte?.toLowerCase().includes("futbol") ||
                   torneo.deporte?.toLowerCase().includes("fútbol") ||
                   torneo.deporte?.toLowerCase().includes("soccer") ||
                   torneo.deporte?.toLowerCase().includes("golito") ||
                   torneo.deporte?.toLowerCase().includes("microfutbol");

  const [activeTab, setActiveTab] = useState<"partidos" | "equipos" | "resumen">("partidos");

  // Estados para la edición del torneo
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(torneo.name);
  const [editEstado, setEditEstado] = useState(torneo.estado);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    setEditName(torneo.name);
    setEditEstado(torneo.estado);
  }, [torneo]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(false);

    if (!editName.trim()) {
      setEditError("El nombre del torneo no puede estar vacío.");
      return;
    }

    startTransition(async () => {
      const res = await updateTorneo(Number(torneo.id), {
        name: editName,
        estado: editEstado,
      });

      if (res.error) {
        setEditError(res.error);
      } else {
        setEditSuccess(true);
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess(false);
          router.refresh();
        }, 1500);
      }
    });
  };

  // Estados de carga e inscripciones reales de la base de datos
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [loadingInscripciones, setLoadingInscripciones] = useState<boolean>(true);

  // Cargar datos del servidor
  const loadInscripciones = async () => {
    try {
      setLoadingInscripciones(true);
      const res = await getInscripcionesPorTorneo(Number(torneo.id));
      if (res.success && res.data) {
        setInscripciones(res.data);
      } else {
        console.error("Error al cargar inscripciones:", res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInscripciones(false);
    }
  };

  useEffect(() => {
    loadInscripciones();
  }, [torneo.id]);

  // Leer la pestaña activa desde la URL al cargar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "equipos" || tab === "partidos" || tab === "resumen") {
        setActiveTab(tab);
      }
    }
  }, []);

  // Manejar eliminación de inscripción
  const handleEliminarInscripcion = async (inscripcionId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este equipo de este torneo?")) {
      return;
    }
    try {
      const res = await deleteInscripcion(inscripcionId);
      if (res.error) {
        alert(res.error);
      } else {
        await loadInscripciones();
      }
    } catch (err) {
      console.error("Error al eliminar inscripción:", err);
      alert("Error al eliminar la inscripción.");
    }
  };

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

  // Inicializar la fecha seleccionada en el primer partido disponible o la fecha actual
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (partidos && partidos.length > 0) {
      const firstMatchDate = new Date(partidos[0].fecha + "T00:00:00");
      if (!isNaN(firstMatchDate.getTime())) {
        return firstMatchDate;
      }
    }
    return new Date();
  });

  const [showAllMatches, setShowAllMatches] = useState(false);

  // Helper para comparar fechas sin horas
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Filtrado de partidos
  const filteredPartidos = showAllMatches
    ? partidos
    : partidos.filter((p) => {
      if (!p.fecha) return false;
      const pDate = new Date(p.fecha + "T00:00:00");
      return isSameDay(pDate, selectedDate);
    });

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setShowAllMatches(false);
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

  // Mapear colores de badge según el estado del torneo
  const statusColors: Record<string, string> = {
    "En Juego": "bg-green-500/10 text-green-500 border-green-500/20",
    "Inscripciones": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Finalizado": "bg-muted text-muted-foreground border-border/60",
    "Suspendido": "bg-red-500/10 text-red-500 border-red-500/20",
  };

  // Mapear colores de badge según el estado del partido
  const matchStatusColors: Record<string, string> = {
    "En Juego": "bg-green-500/10 text-green-500 border-green-500/20",
    "Programado": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Finalizado": "bg-muted text-muted-foreground border-border/60",
    "Suspendido": "bg-red-500/10 text-red-500 border-red-500/20",
  };

  // Mapear colores de badge según el tipo de juego
  const tipoJuegoColors: Record<string, string> = {
    "OFICIAL": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "AMISTOSO": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "LIGUILLA": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  };

  // Formatear periodo de fechas
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
    } catch {
      return "—";
    }
  };

  // Formatear hora de juego (HH:MM:SS -> HH:MM AM/PM)
  const formatHora = (horaStr?: string) => {
    if (!horaStr) return "—";
    try {
      const parts = horaStr.split(":");
      if (parts.length < 2) return horaStr;
      const h = parseInt(parts[0], 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHours = h % 12 === 0 ? 12 : h % 12;
      const minutes = parts[1];
      return `${displayHours}:${minutes} ${ampm}`;
    } catch {
      return horaStr;
    }
  };

  // Equipos simulados para la competición
  const mockTeams = [
    { name: "Águilas Reales", representative: "Carlos Mendoza", status: "Confirmado", players: 12 },
    { name: "Titanes del Deporte", representative: "Sofía Ramírez", status: "Confirmado", players: 14 },
    { name: "Fieras F.C.", representative: "Héctor Gómez", status: "Confirmado", players: 11 },
    { name: "Leones del Norte", representative: "Marta Valenzuela", status: "Pendiente", players: 10 },
  ];

  return (
    <div className="space-y-8">
      {/* Cabecera / Botón de retroceso */}
      <div>
        <Link
          href="/dashboard/torneos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-3"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Torneos
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center">
              {getSportIcon(torneo.deporte)}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase leading-tight">{torneo.name}</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-0.5">
                <span>{torneo.deporte}</span> • <span>Categoría {torneo.rama}</span>
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm border w-fit ${statusColors[torneo.estado] || statusColors["Inscripciones"]}`}>
            {torneo.estado}
          </span>
        </div>
      </div>

      {/* Selector de Pestañas (Tabs) — Navy Theme matching layout */}
      <div className="bg-[oklch(0.25_0.05_255)] border border-white/10 shadow-md p-1.5 rounded-sm flex gap-2 w-full md:w-fit">
        <button
          onClick={() => setActiveTab("partidos")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-200
            ${activeTab === "partidos"
              ? "bg-primary text-primary-foreground shadow"
              : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
        >
          <FaCalendarAlt className="h-4 w-4" />
          Partidos
          <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${activeTab === "partidos" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-white/10 text-white/60"}`}>
            {partidos.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("equipos")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-200
            ${activeTab === "equipos"
              ? "bg-primary text-primary-foreground shadow"
              : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
        >
          <FaUsers className="h-4 w-4" />
          Equipos
          <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${activeTab === "equipos" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-white/10 text-white/60"}`}>
            {loadingInscripciones ? "..." : inscripciones.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("resumen")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-200
            ${activeTab === "resumen"
              ? "bg-primary text-primary-foreground shadow"
              : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
        >
          <FaInfoCircle className="h-4 w-4" />
          Resumen
        </button>
      </div>

      {/* Contenido de las Pestañas */}
      <div className="transition-all duration-300">

        {/* PESTAÑA: RESUMEN / FICHA TÉCNICA */}
        {activeTab === "resumen" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ficha Técnica */}
            <Card className="lg:col-span-2 border-border/60 border-t-4 border-t-primary/70 shadow-md">
              <CardHeader className="bg-muted/15 border-b border-border/50 py-4">
                <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                  <FaInfoCircle className="text-primary h-4.5 w-4.5" />
                  Ficha Técnica
                </CardTitle>
                <CardDescription className="text-xs">Información general y parámetros de la competencia.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-sm">

                {/* Deporte */}
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-muted-foreground font-semibold">Deporte</span>
                  <span className="font-bold text-foreground flex items-center gap-1.5 uppercase text-xs">
                    {getSportIcon(torneo.deporte)}
                    {torneo.deporte}
                  </span>
                </div>

                {/* Rama */}
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-muted-foreground font-semibold">Categoría</span>
                  <span className="font-bold text-foreground uppercase text-xs">{torneo.rama}</span>
                </div>

                {/* Fecha Inicio */}
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-muted-foreground font-semibold">Fecha de Inicio</span>
                  <span className="font-bold text-foreground text-xs">{formatDate(torneo.fechaInicio)}</span>
                </div>

                {/* Fecha Fin */}
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-muted-foreground font-semibold">Fecha Estimada de Fin</span>
                  <span className="font-bold text-foreground text-xs">{formatDate(torneo.fechaFin)}</span>
                </div>

                {/* Organizador */}
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-muted-foreground font-semibold">Organizador</span>
                  <span className="font-bold text-foreground text-xs flex items-center gap-1">
                    <FaUser className="h-3 w-3 text-muted-foreground" />
                    {torneo.user?.nombre} {torneo.user?.apellidos}
                  </span>
                </div>

                {/* Escenario Principal */}
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-muted-foreground font-semibold">Escenario Principal</span>
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5 uppercase">
                    <FaMapMarkerAlt className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    {torneo.escenario ? (
                      torneo.escenario.nombre
                    ) : (
                      <span className="italic text-muted-foreground/60 font-medium">Sin escenario principal</span>
                    )}
                  </span>
                </div>

                {/* Reglamento */}
                {torneo.reglamento ? (
                  <div className="pt-2">
                    <a
                      href={`${baseUrl}/uploads/torneos/${torneo.reglamento}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <Button variant="outline" className="w-full font-bold uppercase tracking-wider text-xs gap-2 rounded-sm border-primary text-primary hover:bg-primary/5 h-12">
                        <FaDownload className="h-3 w-3" />
                        Descargar Reglamento Oficial
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/15 border border-border/40 rounded-sm text-center text-xs text-muted-foreground italic">
                    Reglamento oficial no adjuntado
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Panel de Control Lateral */}
            <Card className="border-border/60 shadow-md">
              <CardHeader className="bg-muted/15 border-b border-border/50 py-4">
                <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                  <FaTrophy className="text-primary h-4.5 w-4.5" />
                  Control de Competición
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 bg-muted/20 border border-border/50 rounded-sm space-y-3">
                  <h4 className="font-bold uppercase tracking-tight text-xs flex items-center gap-2">
                    <FaCheckCircle className="text-green-500 h-4 w-4" />
                    Configuración del Estado
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El estado del torneo controla el comportamiento en las inscripciones de equipos y visibilidad pública de las llaves/partidos.
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wide block mb-1">Estado en la Base de Datos:</span>
                    <div className="text-xs font-black uppercase tracking-wide px-3 py-1.5 bg-background border border-border/60 rounded-sm w-fit shadow-sm">
                      {torneo.estado}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full font-bold rounded-sm h-10 bg-primary hover:bg-primary/95 text-primary-foreground border-none text-[11px] uppercase tracking-wider gap-1.5 justify-center"
                >
                  <FaEdit className="h-4 w-4" />
                  Editar Torneo
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* PESTAÑA: EQUIPOS */}
        {activeTab === "equipos" && (
          <Card className="border-border/60 shadow-md">
            <CardHeader className="border-b border-border/50 bg-muted/15 flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
              <div>
                <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                  <FaUsers className="text-primary h-4 w-4" />
                  Equipos Inscritos
                </CardTitle>
                <CardDescription className="text-xs">Lista de delegaciones confirmadas para este torneo.</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-sm uppercase tracking-wide">
                  {loadingInscripciones ? "..." : `${inscripciones.length} Equipos`}
                </span>
                <Link href={`/dashboard/torneos/gestionar-torneo/inscribir-equipo?id=${torneo.id}`}>
                  <Button
                    size="sm"
                    className="font-bold text-[10px] uppercase tracking-wider h-8 rounded-sm gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95"
                  >
                    <FaPlus className="h-3 w-3" />
                    Inscribir Equipo
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingInscripciones ? (
                <div className="p-12 text-center space-y-3">
                  <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-xs text-muted-foreground font-semibold">Cargando delegaciones...</p>
                </div>
              ) : inscripciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/5 rounded-sm space-y-4 m-6">
                  <FaUsers className="h-8 w-8 text-muted-foreground/60" />
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">No hay equipos inscritos</h4>
                    <p className="text-muted-foreground text-xs max-w-sm mt-0.5">
                      Comienza inscribiendo delegaciones oficiales para que participen en los partidos del torneo.
                    </p>
                  </div>
                  <Link href={`/dashboard/torneos/gestionar-torneo/inscribir-equipo?id=${torneo.id}`}>
                    <Button
                      size="sm"
                      className="font-bold text-[10px] uppercase tracking-wider h-8 rounded-sm gap-1.5"
                    >
                      <FaPlus className="h-3 w-3" /> Inscribir el primero
                    </Button>
                  </Link>
                </div>
              ) : (
                (() => {
                  const sortedInscripciones = [...inscripciones].sort((a, b) => {
                    const ptsDiff = (b.puntos ?? 0) - (a.puntos ?? 0);
                    if (ptsDiff !== 0) return ptsDiff;
                    
                    const difDiff = (b.diferencia ?? 0) - (a.diferencia ?? 0);
                    if (difDiff !== 0) return difDiff;
                    
                    return (b.puntosFavor ?? 0) - (a.puntosFavor ?? 0);
                  });

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/60 bg-muted/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <th className="text-center px-4 py-3">Posición</th>
                            <th className="text-left px-6 py-3">Nombre del Equipo</th>
                            <th className="text-left px-6 py-3">Delegado</th>
                            <th className="text-left px-6 py-3">Contacto</th>
                            <th className="text-center px-3 py-3 text-foreground/80" title="Partidos Jugados">PJ</th>
                            <th className="text-center px-3 py-3 text-green-500/80" title="Partidos Ganados">PG</th>
                            {isFutbol && (
                              <th className="text-center px-3 py-3 text-amber-500/80" title="Partidos Empatados">PE</th>
                            )}
                            <th className="text-center px-3 py-3 text-rose-500/80" title="Partidos Perdidos">PP</th>
                            <th className="text-center px-3 py-3 text-muted-foreground" title="Puntos/Goles a Favor">PF</th>
                            <th className="text-center px-3 py-3 text-muted-foreground" title="Puntos/Goles en Contra">PC</th>
                            <th className="text-center px-3 py-3" title="Diferencia de Puntos/Goles">DG</th>
                            <th className="text-center px-3 py-3 text-primary font-black bg-primary/5" title="Puntos Totales">PTS</th>
                            <th className="text-center px-6 py-3">Estado</th>
                            <th className="text-right px-6 py-3">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedInscripciones.map((insc, idx) => (
                            <tr key={insc.id || idx} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                              <td className="px-4 py-3.5 text-center">
                                <span className={cn(
                                  "inline-flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-black",
                                  idx === 0 ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                                  idx === 1 ? "bg-slate-400/20 text-slate-400 border border-slate-400/30" :
                                  idx === 2 ? "bg-orange-600/20 text-orange-500 border border-orange-600/30" :
                                  "text-muted-foreground/60"
                                )}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 font-bold uppercase text-xs tracking-tight text-foreground">
                                <div className="flex items-center gap-3">
                                  {insc.equipo?.foto ? (
                                    <img
                                      src={insc.equipo.foto}
                                      alt={insc.equipo.nombre}
                                      className="h-8 w-8 rounded-full object-cover border border-border/60 shrink-0"
                                    />
                                  ) : (
                                    <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br shadow-sm uppercase ${getGradientBg(insc.equipo?.nombre || "EQ")}`}>
                                      {getInitials(insc.equipo?.nombre || "EQ")}
                                    </div>
                                  )}
                                  <span className="truncate">{insc.equipo?.nombre || "Equipo sin nombre"}</span>
                                </div>
                              </td>
                              <td className="px-6 py-3.5 text-xs text-muted-foreground">{insc.equipo?.representante || "—"}</td>
                              <td className="px-6 py-3.5 text-xs text-muted-foreground">
                                {insc.equipo?.telefono || insc.equipo?.correo ? (
                                  <div className="flex flex-col">
                                    {insc.equipo.telefono && <span className="font-semibold text-foreground/80">{insc.equipo.telefono}</span>}
                                    {insc.equipo.correo && <span className="text-[10px] opacity-75">{insc.equipo.correo}</span>}
                                  </div>
                                ) : (
                                  "—"
                                )}
                              </td>
                              {/* Estadísticas de Inscripción */}
                              <td className="px-3 py-3.5 text-center font-bold text-xs text-foreground/90">{insc.partidosJugados ?? 0}</td>
                              <td className="px-3 py-3.5 text-center font-bold text-xs text-green-500">{insc.partidosGanados ?? 0}</td>
                              {isFutbol && (
                                <td className="px-3 py-3.5 text-center font-bold text-xs text-amber-500">{insc.partidosEmpatados ?? 0}</td>
                              )}
                              <td className="px-3 py-3.5 text-center font-bold text-xs text-rose-500">{insc.partidosPerdidos ?? 0}</td>
                              <td className="px-3 py-3.5 text-center font-semibold text-xs text-muted-foreground/90">{insc.puntosFavor ?? 0}</td>
                              <td className="px-3 py-3.5 text-center font-semibold text-xs text-muted-foreground/90">{insc.puntosContra ?? 0}</td>
                              <td className={cn(
                                "px-3 py-3.5 text-center font-black text-xs",
                                (insc.diferencia ?? 0) > 0 ? "text-emerald-500" : (insc.diferencia ?? 0) < 0 ? "text-rose-500" : "text-muted-foreground"
                              )}>
                                {(insc.diferencia ?? 0) > 0 ? `+${insc.diferencia}` : insc.diferencia ?? 0}
                              </td>
                              <td className="px-3 py-3.5 text-center font-black text-xs text-primary bg-primary/5">{insc.puntos ?? 0}</td>
                              
                              <td className="px-6 py-3.5 text-center">
                                <span className="inline-flex px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border-green-500/20">
                                  {insc.estado || "Activo"}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 text-right flex items-center justify-end gap-1.5">
                                <Link href={`/dashboard/torneos/gestionar-torneo/inscribir-planilla?id=${torneo.id}&equipoId=${insc.equipo?.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Gestionar Planilla de Jugadores"
                                    className="h-8 w-8 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300 rounded-sm"
                                  >
                                    <FaClipboardList className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEliminarInscripcion(insc.id)}
                                  title="Eliminar Inscripción de Equipo"
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
                  );
                })()
              )}
            </CardContent>
          </Card>
        )}

        {/* PESTAÑA: PARTIDOS */}
        {activeTab === "partidos" && (
          <Card className="border-border/60 shadow-md">
            <CardHeader className="border-b border-border/50 bg-muted/15 flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                  <FaCalendarAlt className="text-primary h-4 w-4" />
                  Programación de Partidos
                </CardTitle>
                <CardDescription className="text-xs">Próximos enfrentamientos y resultados recientes.</CardDescription>
              </div>
              <Link href={`/dashboard/torneos/gestionar-torneo/programar-partido?id=${torneo.id}`}>
                <Button size="sm" className="font-bold text-[10px] uppercase tracking-wider h-8 rounded-sm">
                  Programar Partido
                </Button>
              </Link>
            </CardHeader>
            {/* Aplicar Componente aqui*/}
            <div className="border-b border-border/40 bg-muted/5">
              <DatePickerStrip selectedDate={selectedDate} onChange={handleDateChange} />
            </div>
            <CardContent className="p-6">
              {partidos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/5 rounded-sm space-y-3">
                  <FaClock className="h-6 w-6 text-muted-foreground/60" />
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">No hay partidos registrados</h4>
                    <p className="text-muted-foreground text-xs max-w-sm mt-0.5">Comienza a organizar la programación de enfrentamientos para este torneo.</p>
                  </div>
                </div>
              ) : filteredPartidos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/5 rounded-sm space-y-3">
                  <FaClock className="h-6 w-6 text-muted-foreground/60" />
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">No hay partidos para este día</h4>
                    <p className="text-muted-foreground text-xs max-w-sm mt-0.5">
                      No se encontraron enfrentamientos programados para el {selectedDate.toLocaleDateString("es-CO", { day: "2-digit", month: "long" })}.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllMatches(true)}
                    className="font-bold text-[10px] uppercase tracking-wider mt-2 rounded-sm border-primary/40 text-primary hover:bg-primary/5"
                  >
                    Ver todos los partidos ({partidos.length})
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {showAllMatches && (
                    <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-sm p-3 mb-2 animate-fadeIn">
                      <span className="text-xs font-semibold text-primary">
                        Mostrando todos los partidos del torneo ({partidos.length})
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllMatches(false)}
                        className="font-bold text-[9px] uppercase tracking-wider h-7 px-2 hover:bg-primary/15 text-primary rounded-sm"
                      >
                        Filtrar por fecha
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPartidos.map((partido) => (
                      <div
                        key={partido.id}
                        className="overflow-hidden border border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-md flex flex-col justify-between rounded-sm bg-card hover:bg-muted/5 group"
                      >
                        {/* Cabecera de la tarjeta del partido */}
                        <div className="px-4 py-2.5 bg-muted/20 border-b border-border/40 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-wider ${matchStatusColors[partido.estado] || matchStatusColors["Programado"]}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${partido.estado === "En Juego" ? "bg-green-500 animate-pulse" : partido.estado === "Finalizado" ? "bg-muted-foreground" : "bg-primary animate-pulse"}`} />
                            {partido.estado || "Programado"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-wider ${tipoJuegoColors[partido.tipoJuego] || tipoJuegoColors["OFICIAL"]}`}>
                            {partido.tipoJuego || "OFICIAL"}
                          </span>
                        </div>

                        {/* Contenido / Enfrentamiento */}
                        <div className="p-5 flex items-center justify-between gap-4 bg-gradient-to-b from-transparent to-muted/5">
                          {/* Equipo Local */}
                          <div className="flex flex-col items-center text-center flex-1 space-y-2">
                            <div className="h-12 w-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-sm text-primary shadow-sm group-hover:scale-105 transition-transform">
                              {partido.equipoLocal?.nombre?.substring(0, 2).toUpperCase() || "LC"}
                            </div>
                            <span className="font-bold text-xs uppercase tracking-tight line-clamp-2 min-h-[2rem] flex items-center justify-center">
                              {partido.equipoLocal?.nombre || "Local"}
                            </span>
                          </div>

                          {/* Separador / Marcador */}
                          <div className="flex flex-col items-center gap-1.5">
                            {partido.local !== null && partido.visitante !== null ? (
                              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-primary text-primary-foreground border border-primary/20 rounded-sm font-black text-sm shadow-md">
                                <span>{partido.local}</span>
                                <span className="text-[10px] opacity-75 font-bold">-</span>
                                <span>{partido.visitante}</span>
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted border border-border/80 flex items-center justify-center shadow-sm">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">VS</span>
                              </div>
                            )}

                            {/* Hora de Juego Centrada debajo del VS */}
                            <span className="text-[9px] font-black uppercase text-sky-400 bg-sky-500/10 border border-sky-500/10 px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm shrink-0">
                              <FaClock className="h-2.5 w-2.5 text-sky-400 animate-pulse" />
                              {formatHora(partido.hora)}
                            </span>
                          </div>

                          {/* Equipo Visitante */}
                          <div className="flex flex-col items-center text-center flex-1 space-y-2">
                            <div className="h-12 w-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-sm text-primary shadow-sm group-hover:scale-105 transition-transform">
                              {partido.equipoVisitante?.nombre?.substring(0, 2).toUpperCase() || "VT"}
                            </div>
                            <span className="font-bold text-xs uppercase tracking-tight line-clamp-2 min-h-[2rem] flex items-center justify-center">
                              {partido.equipoVisitante?.nombre || "Visitante"}
                            </span>
                          </div>
                        </div>

                        {/* Pie de la tarjeta con fecha/hora y escenario */}
                        <div className="px-4 py-3 bg-muted/15 border-t border-border/40 text-xs text-muted-foreground space-y-2">
                          {showAllMatches && (
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 pb-1.5 border-b border-border/10">
                              <FaCalendarAlt className="h-3 w-3 text-primary/70 shrink-0" />
                              <span>{formatDate(partido.fecha)}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate font-semibold">{partido.escenario?.nombre || "Por definir"}</span>
                          </div>
                          {partido.descripcion && (
                            <div className="text-[10px] text-muted-foreground/80 italic pt-1.5 border-t border-border/30">
                              {partido.descripcion}
                            </div>
                          )}
                          <div className="pt-2 border-t border-border/20">
                            <Link href={`/dashboard/torneos/gestionar-torneo/partido-periodos?id=${torneo.id}&partidoId=${partido.id}`} className="w-full block">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full font-bold text-[10px] uppercase tracking-wider h-8 rounded-sm gap-1.5 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary transition-all duration-200"
                              >
                                <FaClipboardList className="h-3 w-3" />
                                Controlar Periodos
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
              }
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Editar Torneo */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-border/60 p-5 bg-muted/15">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <FaEdit className="text-primary" />
                  Editar Torneo
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Modifica los detalles básicos del torneo.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-sm text-sm"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              
              {/* Nombre del torneo */}
              <div className="space-y-2">
                <label htmlFor="edit-name" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Nombre del Torneo</label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                  required
                  className="h-12 bg-background/50 border-border rounded-sm w-full font-bold uppercase text-xs"
                  placeholder="Ej. Torneo de Integración Puro Deporte"
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Estado del Torneo</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Inscripciones", "En Juego", "Finalizado", "Suspendido"].map((est) => (
                    <label
                      key={est}
                      className={`flex items-center justify-center gap-2 h-12 rounded-sm border cursor-pointer font-bold text-[10px] uppercase tracking-wider transition-all select-none
                        ${editEstado === est 
                          ? "bg-primary border-primary text-primary-foreground shadow-sm" 
                          : "bg-background border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"}`}
                    >
                      <input
                        type="radio"
                        name="estado"
                        value={est}
                        checked={editEstado === est}
                        onChange={() => setEditEstado(est)}
                        className="sr-only"
                      />
                      {est}
                    </label>
                  ))}
                </div>
              </div>

              {/* Mensajes de feedback */}
              {editError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-xs font-semibold text-center">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-xs font-semibold text-center flex items-center justify-center gap-2">
                  <FaCheckCircle className="h-4 w-4" />
                  Torneo actualizado correctamente
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 font-bold rounded-sm text-xs uppercase tracking-wider"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 font-bold rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none text-xs uppercase tracking-wider"
                  disabled={isPending}
                >
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
