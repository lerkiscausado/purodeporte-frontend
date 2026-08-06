"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FaBan, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { updatePartido } from "@/app/actions/partidos";

const MAX_CHARS = 500;

interface CancelarPartidoModalProps {
  partido: {
    id: number;
    descripcion?: string;
    equipoLocal?: { nombre?: string };
    equipoVisitante?: { nombre?: string };
  };
}

export function CancelarPartidoModal({ partido }: CancelarPartidoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [motivo, setMotivo] = useState(partido.descripcion || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const remaining = MAX_CHARS - motivo.length;

  const handleOpen = () => {
    setMotivo(partido.descripcion || "");
    setError(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!isPending) setIsOpen(false);
  };

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await updatePartido(partido.id, {
        estado: "Cancelado",
        descripcion: motivo.trim() || "",
      });
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  const localName = partido.equipoLocal?.nombre || "Local";
  const visitanteName = partido.equipoVisitante?.nombre || "Visitante";

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        title="Cancelar partido"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-destructive/40 bg-destructive/5 text-destructive text-[10px] font-black uppercase tracking-wider hover:bg-destructive/15 hover:border-destructive/70 transition-all duration-150"
      >
        <FaTimes className="h-3 w-3" />
        Cancelar Partido
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        {/* Modal container */}
        <div
          className={`bg-card w-full max-w-md border-y border-r border-border/60 border-l-4 border-l-destructive/70 rounded-sm shadow-xl overflow-hidden transition-all duration-300 transform
            ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 p-5 bg-destructive/5">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-destructive">
                <FaBan className="text-destructive" />
                Cancelar Partido
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {localName} vs {visitanteName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-sm"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Warning */}
            <div className="flex items-start gap-3 p-3 bg-destructive/8 border border-destructive/25 rounded-sm">
              <FaExclamationTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive/90 font-semibold leading-relaxed">
                Esta acción marcará el partido como <strong>Cancelado</strong>. Puedes indicar
                el motivo a continuación.
              </p>
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <Label
                htmlFor={`cancelar-motivo-${partido.id}`}
                className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
              >
                Motivo de cancelación{" "}
                <span className="text-muted-foreground font-normal normal-case tracking-normal">(opcional)</span>
              </Label>
              <textarea
                id={`cancelar-motivo-${partido.id}`}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value.slice(0, MAX_CHARS))}
                rows={4}
                placeholder="Ej. Mal tiempo, falta de jugadores, solicitud del organizador…"
                className="w-full resize-none rounded-sm border border-border bg-background/50 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-destructive/40 focus:border-destructive/60 transition-all duration-150 disabled:opacity-50"
                disabled={isPending}
              />
              <p
                className={`text-[11px] text-right font-semibold transition-colors ${
                  remaining <= 50 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {remaining} caracteres restantes
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 font-bold rounded-sm"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1 h-11 font-bold rounded-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground border-none"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      />
                    </svg>
                    Cancelando...
                  </span>
                ) : (
                  "Confirmar Cancelación"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
