"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaTrash, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { deleteJugador } from "@/app/actions/jugadores";

interface DeleteJugadorButtonProps {
  jugadorId: number;
  jugadorNombre: string;
}

export function DeleteJugadorButton({ jugadorId, jugadorNombre }: DeleteJugadorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteJugador(jugadorId);
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-destructive hover:text-destructive/80 transition-colors"
        title="Eliminar jugador"
      >
        <FaTrash className="h-3.5 w-3.5" />
      </button>

      {/* Modal Confirmación */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className={`bg-card w-full max-w-sm border-y border-r border-border/60 border-l-4 border-l-destructive/70 rounded-sm shadow-xl overflow-hidden transition-all duration-300 transform
            ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between border-b border-border/60 p-5 bg-muted/15">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-destructive h-5 w-5" />
              <h2 className="text-base font-black uppercase tracking-tight">Confirmar Eliminación</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-sm"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de eliminar al jugador <span className="font-black text-foreground uppercase">{jugadorNombre}</span>? Esta acción no se puede deshacer.
            </p>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 font-bold rounded-sm"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1 h-10 font-bold rounded-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground border-none"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
