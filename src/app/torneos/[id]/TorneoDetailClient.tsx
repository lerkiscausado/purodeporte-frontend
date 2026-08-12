"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Torneo, Partido } from "@/types";
import { EquipoAvatar } from "@/components/EquipoAvatar";
import { PartidoItem } from "@/components/PartidoItem";
import { FaUsers, FaTrophy, FaCalendarAlt, FaUser } from "react-icons/fa";
import { Heart } from "lucide-react";
import { agregarFavorito, eliminarFavorito } from "@/app/actions/favoritos";

export function FavoritoButton({
  torneoId,
  initialIsFavorito = false,
  isAuthenticated = false,
}: {
  torneoId: number;
  initialIsFavorito?: boolean;
  isAuthenticated?: boolean;
}) {
  const router = useRouter();
  const [isFav, setIsFav] = useState(initialIsFavorito);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isPending) return;

    const previousState = isFav;
    setIsFav(!previousState);
    setErrorMsg(null);
    setIsPending(true);

    try {
      const res = previousState
        ? await eliminarFavorito(torneoId)
        : await agregarFavorito(torneoId);

      if (!res.success) {
        setIsFav(previousState);
        setErrorMsg(res.error || "Error al actualizar favoritos.");
      }
    } catch {
      setIsFav(previousState);
      setErrorMsg("Error de conexión al actualizar favoritos.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all duration-200 cursor-pointer ${
          isFav
            ? "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
            : "bg-card text-muted-foreground border-border/60 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5"
        }`}
      >
        <Heart
          className={`h-4 w-4 transition-transform active:scale-125 ${
            isFav ? "fill-rose-500 text-rose-500" : ""
          }`}
        />
        <span>{isFav ? "Favorito" : "Agregar a Favoritos"}</span>
      </button>
      {errorMsg && (
        <span className="text-[10px] text-destructive font-semibold">
          {errorMsg}
        </span>
      )}
    </div>
  );
}

interface TorneoDetailClientProps {
  torneo: Torneo;
  inscripciones: any[];
  partidos: Partido[];
  isFavorito?: boolean;
  isAuthenticated?: boolean;
}

export function TorneoDetailClient({
  torneo,
  inscripciones,
  partidos,
  isFavorito = false,
  isAuthenticated = false,
}: TorneoDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"posiciones" | "equipos" | "partidos">("posiciones");

  const proximosPartidos = partidos
    .filter((p) => p.estado === "Pendiente")
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const resultadosPartidos = partidos
    .filter((p) => p.estado === "Finalizado")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const canceladosPartidos = partidos
    .filter((p) => p.estado === "Cancelado")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas (Estilo GestionarTorneoClient) */}
      <div className="bg-[oklch(0.25_0.05_255)] border border-white/10 shadow-md p-1.5 rounded-sm flex gap-2 w-full md:w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab("posiciones")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-200 ${
            activeTab === "posiciones"
              ? "bg-primary text-primary-foreground shadow"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <FaTrophy className="h-4 w-4" />
          Posiciones
          <span
            className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${
              activeTab === "posiciones"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-white/10 text-white/60"
            }`}
          >
            {inscripciones.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("partidos")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-200 ${
            activeTab === "partidos"
              ? "bg-primary text-primary-foreground shadow"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <FaCalendarAlt className="h-4 w-4" />
          Partidos
          <span
            className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${
              activeTab === "partidos"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-white/10 text-white/60"
            }`}
          >
            {partidos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("equipos")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-200 ${
            activeTab === "equipos"
              ? "bg-primary text-primary-foreground shadow"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <FaUsers className="h-4 w-4" />
          Equipos
          <span
            className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${
              activeTab === "equipos"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-white/10 text-white/60"
            }`}
          >
            {inscripciones.length}
          </span>
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      {activeTab === "posiciones" && (
        <div className="bg-card border border-border/60 rounded-sm shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
              <FaTrophy className="h-4 w-4 text-primary" /> Tabla de Posiciones
            </h3>
            <span className="text-xs text-muted-foreground font-semibold">
              {inscripciones.length} {inscripciones.length === 1 ? "Equipo" : "Equipos"}
            </span>
          </div>

          {inscripciones.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm font-medium">
              Aún no hay equipos inscritos en este torneo.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 uppercase tracking-wider text-[10px] font-bold text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="py-3 px-3 text-center w-10">#</th>
                    <th className="py-3 px-4">Equipo</th>
                    <th className="py-3 px-2 text-center" title="Partidos Jugados">PJ</th>
                    <th className="py-3 px-2 text-center" title="Partidos Ganados">PG</th>
                    <th className="py-3 px-2 text-center" title="Partidos Empatados">PE</th>
                    <th className="py-3 px-2 text-center" title="Partidos Perdidos">PP</th>
                    <th className="py-3 px-2 text-center" title="Puntos / Goles a Favor">PF</th>
                    <th className="py-3 px-2 text-center" title="Puntos / Goles en Contra">PC</th>
                    <th className="py-3 px-2 text-center" title="Diferencia">DIF</th>
                    <th className="py-3 px-3 text-center bg-primary/10 text-primary font-black" title="Puntos Totales">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {inscripciones.map((item, idx) => {
                    const equipo = item.equipo || {};
                    const nombreEquipo = equipo.nombre || "Equipo";
                    const fotoEquipo = equipo.foto || equipo.escudo || null;

                    return (
                      <tr key={item.id || idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <EquipoAvatar nombre={nombreEquipo} foto={fotoEquipo} size="sm" />
                            <span className="font-bold text-foreground text-xs uppercase truncate max-w-[200px]" title={nombreEquipo}>
                              {nombreEquipo}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">{item.partidosJugados ?? 0}</td>
                        <td className="py-3 px-2 text-center">{item.partidosGanados ?? 0}</td>
                        <td className="py-3 px-2 text-center">{item.partidosEmpatados ?? 0}</td>
                        <td className="py-3 px-2 text-center">{item.partidosPerdidos ?? 0}</td>
                        <td className="py-3 px-2 text-center text-muted-foreground">{item.puntosFavor ?? 0}</td>
                        <td className="py-3 px-2 text-center text-muted-foreground">{item.puntosContra ?? 0}</td>
                        <td className={`py-3 px-2 text-center font-bold ${(item.diferencia ?? 0) > 0 ? "text-emerald-500" : (item.diferencia ?? 0) < 0 ? "text-rose-500" : "text-muted-foreground"}`}>
                          {(item.diferencia ?? 0) > 0 ? `+${item.diferencia}` : item.diferencia ?? 0}
                        </td>
                        <td className="py-3 px-3 text-center bg-primary/5 text-primary font-black text-sm">
                          {item.puntos ?? 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "partidos" && (
        <div className="space-y-8">
          {partidos.length === 0 ? (
            <div className="bg-card border border-border/60 rounded-sm p-12 text-center text-muted-foreground text-sm font-medium">
              Aún no hay partidos programados para este torneo.
            </div>
          ) : (
            <>
              {/* Sección Próximos */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Próximos Partidos
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-primary/10 text-primary">
                    {proximosPartidos.length}
                  </span>
                </div>

                {proximosPartidos.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3">
                    No hay partidos próximos programados.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {proximosPartidos.map((partido) => (
                      <PartidoItem key={partido.id} partido={partido} />
                    ))}
                  </div>
                )}
              </div>

              {/* Sección Resultados */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Resultados
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">
                    {resultadosPartidos.length}
                  </span>
                </div>

                {resultadosPartidos.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3">
                    Aún no hay partidos finalizados en este torneo.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resultadosPartidos.map((partido) => (
                      <PartidoItem key={partido.id} partido={partido} />
                    ))}
                  </div>
                )}
              </div>

              {/* Sección Cancelados — solo se muestra si hay al menos uno */}
              {canceladosPartidos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-destructive/30 pb-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                      Cancelados
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-destructive/10 text-destructive">
                      {canceladosPartidos.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {canceladosPartidos.map((partido) => (
                      <div key={partido.id}>
                        <PartidoItem partido={partido} />
                        {partido.descripcion && (
                          <div className="text-xs text-destructive font-semibold mt-2 pt-2 border-t border-destructive/20">
                            Motivo: {partido.descripcion}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "equipos" && (
        <div className="space-y-4">
          {inscripciones.length === 0 ? (
            <div className="bg-card border border-border/60 rounded-sm p-12 text-center text-muted-foreground text-sm font-medium">
              Aún no hay equipos inscritos en este torneo.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inscripciones.map((item, idx) => {
                const equipo = item.equipo || {};
                const nombreEquipo = equipo.nombre || "Equipo Inscrito";
                const fotoEquipo = equipo.foto || equipo.escudo || null;
                const representante = equipo.representante;

                return (
                  <div
                    key={item.id || idx}
                    className="bg-card border border-border/60 rounded-sm p-4 flex items-center gap-3.5 shadow-sm hover:border-primary/40 transition-colors"
                  >
                    <EquipoAvatar nombre={nombreEquipo} foto={fotoEquipo} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-sm text-foreground uppercase tracking-tight truncate" title={nombreEquipo}>
                        {nombreEquipo}
                      </h4>
                      {representante ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium truncate">
                          <FaUser className="h-3 w-3 text-primary/70 shrink-0" />
                          <span className="truncate">{representante}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/60 italic mt-1">
                          Sin representante registrado
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
