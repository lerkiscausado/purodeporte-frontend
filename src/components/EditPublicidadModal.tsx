"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEdit, FaCheck, FaTimes, FaImage, FaLink, FaCalendarAlt } from "react-icons/fa";
import { updatePublicidad } from "@/app/actions/publicidad";
import { getUploadUrl } from "@/lib/uploads";
import { Publicidad } from "@/types";

interface EditPublicidadModalProps {
  publicidad: Publicidad;
}

export function EditPublicidadModal({ publicidad }: EditPublicidadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Helper to format ISO date string to YYYY-MM-DD for date inputs
  const formatDateForInput = (dStr?: string) => {
    if (!dStr) return "";
    return dStr.split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const fechaInicio = formData.get("fechaInicio") as string;
    const fechaFin = formData.get("fechaFin") as string;

    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    startTransition(async () => {
      const result = await updatePublicidad(publicidad.id, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          router.refresh();
        }, 1200);
      }
    });
  };

  return (
    <>
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded-sm hover:bg-primary/10"
        title="Editar publicidad"
      >
        <FaEdit className="h-4 w-4" />
      </button>

      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Modal Contenedor */}
        <div
          className={`bg-card w-full max-w-lg border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-xl overflow-hidden transition-all duration-300 transform max-h-[90vh] flex flex-col
            ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between border-b border-border/60 p-5 bg-muted/15 shrink-0">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                <FaEdit className="text-primary" />
                Editar Publicidad
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Modifica el enlace, las fechas de vigencia o la imagen del anuncio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-sm"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
            {/* Link */}
            <div className="space-y-2">
              <Label htmlFor="edit-link" className="font-bold text-sm flex items-center gap-1.5">
                <FaLink className="text-primary h-3.5 w-3.5" /> Enlace de Destino (URL)
              </Label>
              <Input
                id="edit-link"
                name="link"
                type="url"
                defaultValue={publicidad.link}
                placeholder="https://..."
                required
                className="h-11 bg-background/50 border-border rounded-sm w-full text-sm"
              />
            </div>

            {/* Fechas de Vigencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-fechaInicio" className="font-bold text-sm flex items-center gap-1.5">
                  <FaCalendarAlt className="text-primary h-3 w-3" /> Fecha de Inicio
                </Label>
                <Input
                  id="edit-fechaInicio"
                  name="fechaInicio"
                  type="date"
                  defaultValue={formatDateForInput(publicidad.fechaInicio)}
                  required
                  className="h-11 bg-background/50 border-border rounded-sm w-full text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-fechaFin" className="font-bold text-sm flex items-center gap-1.5">
                  <FaCalendarAlt className="text-primary h-3 w-3" /> Fecha de Fin
                </Label>
                <Input
                  id="edit-fechaFin"
                  name="fechaFin"
                  type="date"
                  defaultValue={formatDateForInput(publicidad.fechaFin)}
                  required
                  className="h-11 bg-background/50 border-border rounded-sm w-full text-sm"
                />
              </div>
            </div>

            {/* Imagen (Opcional en edición) */}
            <div className="space-y-2">
              <Label htmlFor="edit-imagen" className="font-bold text-sm">
                Imagen del Anuncio
              </Label>

              {publicidad.imagen && (
                <div className="flex items-center gap-3 p-2 bg-muted/20 border border-border/40 rounded-sm mb-1">
                  <div className="h-14 w-14 rounded-sm bg-muted overflow-hidden relative shrink-0 border border-border/60">
                    <img
                      src={getUploadUrl("publicidad", publicidad.imagen)}
                      alt="Anuncio actual"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Imagen actual del anuncio
                  </span>
                </div>
              )}

              <div className="relative">
                <Input
                  id="edit-imagen"
                  name="imagen"
                  type="file"
                  accept="image/*"
                  className="bg-card file:bg-primary/10 file:text-primary file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 file:font-bold hover:file:bg-primary/20 cursor-pointer pt-2 text-xs border-border/60 rounded-sm h-11 pl-10"
                />
                <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Deja este campo vacío para conservar la imagen actual.
              </p>
            </div>

            {/* Feedback */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <FaCheck className="h-4 w-4" />
                Publicidad actualizada correctamente
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 font-bold rounded-sm"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 font-bold rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none"
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
