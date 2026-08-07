"use client";

import { useState } from "react";
import Link from "next/link";
import { getUploadUrl } from "@/lib/uploads";
import { eliminarFavorito } from "@/app/actions/favoritos";
import { Heart, Trophy, Calendar, ExternalLink, Trash2 } from "lucide-react";
import { FaFutbol, FaBasketballBall, FaVolleyballBall } from "react-icons/fa";

const getSportIcon = (deporte?: string) => {
  if (!deporte) return <Trophy className="h-4 w-4 text-primary" />;
  const dep = deporte.toLowerCase();
  if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer") || dep.includes("futsal")) {
    return <FaFutbol className="h-4 w-4 text-emerald-500" />;
  }
  if (dep.includes("basket") || dep.includes("baloncesto")) {
    return <FaBasketballBall className="h-4 w-4 text-orange-500" />;
  }
  if (dep.includes("voley") || dep.includes("voleibol")) {
    return <FaVolleyballBall className="h-4 w-4 text-indigo-500" />;
  }
  return <Trophy className="h-4 w-4 text-primary" />;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return null;
  }
};

export function FavoritosClient({ initialFavoritos }: { initialFavoritos: any[] }) {
  const [favoritos, setFavoritos] = useState(initialFavoritos);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleRemove = async (torneoId: number) => {
    if (deletingId) return;

    setDeletingId(torneoId);
    const previous = [...favoritos];
    setFavoritos((prev) =>
      prev.filter((item) => {
        const t = item.torneo || item;
        return Number(t.id) !== torneoId;
      })
    );

    try {
      const res = await eliminarFavorito(torneoId);
      if (!res.success) {
        setFavoritos(previous);
      }
    } catch {
      setFavoritos(previous);
    } finally {
      setDeletingId(null);
    }
  };

  if (favoritos.length === 0) {
    return (
      <div className="bg-card border border-border/60 rounded-sm p-12 text-center space-y-4 shadow-sm">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Heart className="h-8 w-8 text-rose-500" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
            No tienes torneos favoritos
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Explora los torneos disponibles y haz clic en el ícono de corazón para guardarlos aquí.
          </p>
        </div>
        <div>
          <Link
            href="/torneos"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            Explorar Torneos
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {favoritos.map((item, idx) => {
        const t = item.torneo || item;
        const torneoId = Number(t.id);
        const fotoRaw = t.foto || t.imagenUrl || t.fotoUrl;
        const fotoUrl = fotoRaw ? getUploadUrl("torneos", fotoRaw) : null;
        const inicioFmt = formatDate(t.fechaInicio);
        const finFmt = formatDate(t.fechaFin);

        return (
          <div
            key={torneoId || idx}
            className="bg-card border border-border/60 rounded-sm overflow-hidden shadow-sm flex flex-col hover:border-primary/40 transition-colors group"
          >
            {/* Image Header */}
            {fotoUrl ? (
              <div className="relative h-36 w-full overflow-hidden bg-muted">
                <img
                  src={fotoUrl}
                  alt={t.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <span className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded-sm text-foreground border border-border/40">
                  {t.estado || "Inscripciones"}
                </span>
              </div>
            ) : (
              <div className="h-20 bg-muted/40 p-4 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSportIcon(t.deporte)}
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {t.deporte || "Deporte"}
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border border-border/60 bg-card text-muted-foreground">
                  {t.estado || "Inscripciones"}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-primary uppercase mb-1">
                  {getSportIcon(t.deporte)}
                  <span>{t.deporte}</span>
                  {t.categoria && <span>• {t.categoria}</span>}
                </div>
                <h3 className="font-black text-base uppercase tracking-tight text-foreground line-clamp-1">
                  {t.nombre}
                </h3>

                {(inicioFmt || finFmt) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>
                      {inicioFmt} {finFmt ? `al ${finFmt}` : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                <Link
                  href={`/torneos/${torneoId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                >
                  Ver Torneo
                  <ExternalLink className="h-3 w-3" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleRemove(torneoId)}
                  disabled={deletingId === torneoId}
                  title="Quitar de favoritos"
                  className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-sm transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
