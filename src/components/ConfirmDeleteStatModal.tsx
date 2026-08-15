"use client";

import { Button } from "@/components/ui/button";
import { FaExclamationTriangle, FaTimes, FaSpinner, FaTrash } from "react-icons/fa";

interface ConfirmDeleteStatModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jugadorNombre: string;
  tipoNombre: string;
  cantidad: number;
  isDeleting: boolean;
}

export function ConfirmDeleteStatModal({
  open,
  onClose,
  onConfirm,
  jugadorNombre,
  tipoNombre,
  cantidad,
  isDeleting,
}: ConfirmDeleteStatModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="bg-card w-full max-w-md border-y border-r border-border/60 border-l-4 border-l-destructive/70 rounded-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 p-5 bg-destructive/5">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-destructive">
              <FaTrash className="text-destructive h-4 w-4" />
              Eliminar Estadística
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Confirmación de eliminación total
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-sm cursor-pointer disabled:opacity-50"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3 p-3.5 bg-destructive/10 border border-destructive/25 rounded-sm">
            <FaExclamationTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs text-foreground leading-relaxed">
              <p>
                Se eliminarán los <strong>{cantidad}</strong> registro(s) de{" "}
                <strong className="text-destructive">&ldquo;{tipoNombre}&rdquo;</strong> de{" "}
                <strong>{jugadorNombre}</strong> en este partido.
              </p>
              <p className="mt-1 text-[11px] text-destructive font-semibold">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 font-bold rounded-sm text-xs uppercase tracking-wider"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1 h-11 font-black rounded-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground border-none uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <FaTrash className="h-3 w-3" />
                  <span>Sí, Eliminar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
