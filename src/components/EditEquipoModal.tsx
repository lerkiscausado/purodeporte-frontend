"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEdit, FaCheck, FaTimes, FaFutbol, FaBasketballBall, FaVolleyballBall } from "react-icons/fa";
import { updateEquipo } from "@/app/actions/equipos";
import { cn } from "@/lib/utils";

interface EditEquipoModalProps {
  equipo: {
    id: number;
    nombre: string;
    representante: string;
    deporte: string;
    foto?: string;
    estado?: string;
    telefono?: string;
    correo?: string;
  };
}

export function EditEquipoModal({ equipo }: EditEquipoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deporte, setDeporte] = useState(equipo.deporte);
  const [estado, setEstado] = useState(equipo.estado || "Activo");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set("deporte", deporte);
    formData.set("estado", estado);

    startTransition(async () => {
      const result = await updateEquipo(equipo.id, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <>
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-primary hover:text-primary/80 transition-colors"
        title="Editar equipo"
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
          className={`bg-card w-full max-w-lg border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-xl overflow-hidden transition-all duration-300 transform
            ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between border-b border-border/60 p-5 bg-muted/15">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <FaEdit className="text-primary" />
                Editar Equipo
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Modifica los datos del equipo.</p>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="edit-nombre" className="font-bold">Nombre del Equipo</Label>
                <Input
                  id="edit-nombre"
                  name="nombre"
                  defaultValue={equipo.nombre}
                  required
                  className="h-12 bg-background/50 border-border rounded-sm w-full"
                />
              </div>

              {/* Representante */}
              <div className="space-y-2">
                <Label htmlFor="edit-representante" className="font-bold">Representante / Delegado</Label>
                <Input
                  id="edit-representante"
                  name="representante"
                  defaultValue={equipo.representante}
                  required
                  className="h-12 bg-background/50 border-border rounded-sm w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deporte */}
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Deporte</Label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Fútbol */}
                  <button
                    type="button"
                    onClick={() => setDeporte("Futbol")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-sm border bg-card text-center transition-all duration-150 cursor-pointer relative overflow-hidden group",
                      deporte === "Futbol"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                        : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                    )}
                  >
                    <FaFutbol className={cn("h-4 w-4 mb-1", deporte === "Futbol" ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-wider block">Fútbol</span>
                    {deporte === "Futbol" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                  </button>

                  {/* Baloncesto */}
                  <button
                    type="button"
                    onClick={() => setDeporte("Baloncesto")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-sm border bg-card text-center transition-all duration-150 cursor-pointer relative overflow-hidden group",
                      deporte === "Baloncesto"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                        : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                    )}
                  >
                    <FaBasketballBall className={cn("h-4 w-4 mb-1", deporte === "Baloncesto" ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-wider block">Basket</span>
                    {deporte === "Baloncesto" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                  </button>

                  {/* Voleibol */}
                  <button
                    type="button"
                    onClick={() => setDeporte("Voleibol")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-sm border bg-card text-center transition-all duration-150 cursor-pointer relative overflow-hidden group",
                      deporte === "Voleibol"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                        : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                    )}
                  >
                    <FaVolleyballBall className={cn("h-4 w-4 mb-1", deporte === "Voleibol" ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-wider block">Voley</span>
                    {deporte === "Voleibol" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                  </button>
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Estado</Label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Activo */}
                  <button
                    type="button"
                    onClick={() => setEstado("Activo")}
                    className={cn(
                      "flex items-center justify-center gap-2 h-10 px-3 rounded-sm border bg-card transition-all duration-150 cursor-pointer relative overflow-hidden group",
                      estado === "Activo"
                        ? "border-green-500 bg-green-500/5 ring-1 ring-green-500/40 shadow-sm"
                        : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", estado === "Activo" ? "bg-green-500 animate-pulse" : "bg-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-wider block">Activo</span>
                  </button>

                  {/* Suspendido */}
                  <button
                    type="button"
                    onClick={() => setEstado("Suspendido")}
                    className={cn(
                      "flex items-center justify-center gap-2 h-10 px-3 rounded-sm border bg-card transition-all duration-150 cursor-pointer relative overflow-hidden group",
                      estado === "Suspendido"
                        ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/40 shadow-sm"
                        : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", estado === "Suspendido" ? "bg-red-500" : "bg-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-wider block">Suspendido</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Teléfono (Opcional) */}
              <div className="space-y-2">
                <Label htmlFor="edit-telefono" className="font-bold">Teléfono <span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
                <Input
                  id="edit-telefono"
                  name="telefono"
                  type="tel"
                  defaultValue={equipo.telefono || ""}
                  placeholder="Ej. +57 300 123 4567"
                  className="h-12 bg-background/50 border border-border rounded-sm w-full"
                />
              </div>

              {/* Correo (Opcional) */}
              <div className="space-y-2">
                <Label htmlFor="edit-correo" className="font-bold">Correo Electrónico <span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
                <Input
                  id="edit-correo"
                  name="correo"
                  type="email"
                  defaultValue={equipo.correo || ""}
                  placeholder="Ej. contacto@equipo.com"
                  className="h-12 bg-background/50 border border-border rounded-sm w-full"
                />
              </div>
            </div>

            {/* Foto (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="edit-foto" className="font-bold">Ruta / URL de Logo o Foto <span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
              <Input
                id="edit-foto"
                name="foto"
                defaultValue={equipo.foto || ""}
                placeholder="Ej. /uploads/equipos/mi-logo.png"
                className="h-12 bg-background/50 border-border rounded-sm w-full"
              />
            </div>

            {/* Mensajes de feedback */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <FaCheck className="h-4 w-4" />
                Equipo actualizado correctamente
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 font-bold rounded-sm"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 font-bold rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none"
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
