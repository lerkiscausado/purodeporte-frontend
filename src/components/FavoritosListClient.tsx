"use client";

import { useState } from "react";
import Link from "next/link";
import { Torneo } from "@/types";
import { eliminarFavorito } from "@/app/actions/favoritos";
import { TorneosPublicListClient } from "@/app/torneos/TorneosPublicListClient";
import { Heart, ExternalLink } from "lucide-react";

export function FavoritosListClient({ initialFavoritos }: { initialFavoritos: Torneo[] }) {
  const [favoritos, setFavoritos] = useState(initialFavoritos);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleRemove = async (torneoId: number) => {
    if (deletingId) return;

    setDeletingId(torneoId);
    const previous = [...favoritos];
    setFavoritos((prev) => prev.filter((item) => Number(item.id) !== torneoId));

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
    <TorneosPublicListClient
      key={favoritos.length}
      initialTorneos={favoritos}
      mode="favoritos"
      onRemoveFavorito={handleRemove}
    />
  );
}
