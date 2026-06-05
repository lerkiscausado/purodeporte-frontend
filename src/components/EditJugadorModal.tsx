"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEdit, FaCheck, FaTimes, FaMars, FaVenus } from "react-icons/fa";
import { updateJugador } from "@/app/actions/jugadores";
import { cn } from "@/lib/utils";

interface EditJugadorModalProps {
  jugador: {
    id: number;
    nombre: string;
    apellidos: string;
    genero: string;
    fechaNacimiento: string;
    estatura: number;
    identificacion?: string;
    estado?: string;
  };
}

export function EditJugadorModal({ jugador }: EditJugadorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [genero, setGenero] = useState(jugador.genero);
  const [estado, setEstado] = useState(jugador.estado || "Activo");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set("genero", genero);
    formData.set("estado", estado);

    startTransition(async () => {
      const result = await updateJugador(jugador.id, formData);
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
        title="Editar jugador"
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
                Editar Jugador
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Modifica los datos del jugador.</p>
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

            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="edit-nombre" className="font-bold">Nombre(s)</Label>
                <Input
                  id="edit-nombre"
                  name="nombre"
                  defaultValue={jugador.nombre}
                  required
                  className="h-12 bg-background/50 border-border rounded-sm w-full"
                />
              </div>

              {/* Apellidos */}
              <div className="space-y-2">
                <Label htmlFor="edit-apellidos" className="font-bold">Apellidos</Label>
                <Input
                  id="edit-apellidos"
                  name="apellidos"
                  defaultValue={jugador.apellidos}
                  required
                  className="h-12 bg-background/50 border-border rounded-sm w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Género */}
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Género</Label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Hombre */}
                  <button
                    type="button"
                    onClick={() => setGenero("Hombre")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 h-10 px-2 rounded-sm border bg-card transition-all duration-150 cursor-pointer relative overflow-hidden group",
                      genero === "Hombre"
                        ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/40 shadow-sm"
                        : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                    )}
                  >
                    <FaMars className={cn("h-3.5 w-3.5 shrink-0 transition-colors", genero === "Hombre" ? "text-blue-500" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-wider block">Hombre</span>
                  </button>

                  {/* Mujer */}
                  <button
                    type="button"
                    onClick={() => setGenero("Mujer")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 h-10 px-2 rounded-sm border bg-card transition-all duration-150 cursor-pointer relative overflow-hidden group",
                      genero === "Mujer"
                        ? "border-pink-500 bg-pink-500/5 ring-1 ring-pink-500/40 shadow-sm"
                        : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                    )}
                  >
                    <FaVenus className={cn("h-3.5 w-3.5 shrink-0 transition-colors", genero === "Mujer" ? "text-pink-500" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-wider block">Mujer</span>
                  </button>
                </div>
              </div>

              {/* Fecha de Nacimiento */}
              <div className="space-y-2">
                <Label htmlFor="edit-fechaNacimiento" className="font-bold">Fecha Nacimiento</Label>
                <Input
                  id="edit-fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  defaultValue={jugador.fechaNacimiento}
                  required
                  className="h-12 bg-background/50 border-border rounded-sm w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Estatura */}
              <div className="space-y-2">
                <Label htmlFor="edit-estatura" className="font-bold">Estatura (m)</Label>
                <Input
                  id="edit-estatura"
                  name="estatura"
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="2.5"
                  defaultValue={jugador.estatura}
                  required
                  className="h-12 bg-background/50 border-border rounded-sm w-full"
                />
              </div>

              {/* Identificación */}
              <div className="space-y-2">
                <Label htmlFor="edit-identificacion" className="font-bold">Identificación</Label>
                <Input
                  id="edit-identificacion"
                  name="identificacion"
                  defaultValue={jugador.identificacion || ""}
                  required
                  className="h-12 bg-background/50 border-border rounded-sm w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Estado */}
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Estado</Label>
                <div className="grid grid-cols-2 gap-3">
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

            {/* Mensajes de feedback */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <FaCheck className="h-4 w-4" />
                Jugador actualizado correctamente
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
