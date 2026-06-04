"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaEdit, FaCheck, FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import { updateEscenario } from "@/app/actions/escenarios";

interface EditEscenarioModalProps {
  escenarioId: number;
  escenarioNombre: string;
  escenarioDireccion: string;
  escenarioDeporte: string;
  escenarioEstado: string;
  escenarioBarrioSector?: string;
  escenarioUbicacion?: string;
}

export function EditEscenarioModal({
  escenarioId,
  escenarioNombre,
  escenarioDireccion,
  escenarioDeporte,
  escenarioEstado,
  escenarioBarrioSector = "",
  escenarioUbicacion = "",
}: EditEscenarioModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [deporte, setDeporte] = useState(escenarioDeporte);
  const [estado, setEstado] = useState(escenarioEstado);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set("deporte", deporte);
    formData.set("estado", estado);

    startTransition(async () => {
      const result = await updateEscenario(escenarioId, formData);
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
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full font-bold rounded-sm h-10 bg-[oklch(0.25_0.05_255)] text-white hover:bg-[oklch(0.30_0.07_255)] border-none text-[11px] uppercase tracking-wider gap-1.5 justify-center"
      >
        <FaEdit className="h-4 w-4" />
        Gestionar Escenario
      </Button>

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
                Editar Escenario
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Modifica los detalles de la instalación deportiva.</p>
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
            
            {/* Nombre del escenario */}
            <div className="space-y-2">
              <Label htmlFor="edit-nombre" className="font-bold">Nombre del Escenario</Label>
              <Input
                id="edit-nombre"
                name="nombre"
                defaultValue={escenarioNombre}
                required
                className="h-12 bg-background/50 border-border rounded-sm w-full"
                placeholder="Ej. Cancha Múltiple La Bombonera"
              />
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="edit-direccion" className="font-bold">Dirección Exacta</Label>
              <Input
                id="edit-direccion"
                name="direccion"
                defaultValue={escenarioDireccion}
                required
                className="h-12 bg-background/50 border-border rounded-sm w-full"
                placeholder="Ej. Calle 45 #12-34"
              />
            </div>

            {/* Barrio / Sector */}
            <div className="space-y-2">
              <Label htmlFor="edit-barrioSector" className="font-bold">Barrio / Sector</Label>
              <Input
                id="edit-barrioSector"
                name="barrioSector"
                defaultValue={escenarioBarrioSector}
                className="h-12 bg-background/50 border-border rounded-sm w-full"
                placeholder="Ej. Barrio Sur, Sector Las Palmas"
              />
            </div>

            {/* Enlace de Ubicación */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-ubicacion" className="font-bold">Enlace de Ubicación (Google Maps / GPS)</Label>
                {escenarioUbicacion && (
                  <a
                    href={escenarioUbicacion.startsWith("http") ? escenarioUbicacion : `https://maps.google.com/?q=${encodeURIComponent(escenarioUbicacion)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-sky-500 hover:text-sky-600 hover:underline transition-colors uppercase tracking-wider"
                  >
                    Probar Enlace
                  </a>
                )}
              </div>
              <Input
                id="edit-ubicacion"
                name="ubicacion"
                defaultValue={escenarioUbicacion}
                className="h-12 bg-background/50 border-border rounded-sm w-full"
                placeholder="Ej. https://maps.app.goo.gl/..."
              />
              <span className="text-[10px] text-muted-foreground block mt-1">
                Tip: Ve a Google Maps, busca el lugar, haz clic en &quot;Compartir&quot; y copia el enlace aquí.
              </span>
            </div>

            {/* Deporte Principal */}
            <div className="space-y-2">
              <Label className="font-bold">Deporte Principal</Label>
              <Select required onValueChange={(val) => setDeporte(val || "")} value={deporte}>
                <SelectTrigger className="bg-background/50 h-12 border-border/60 rounded-sm">
                  <SelectValue placeholder="Selecciona la disciplina" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="Multiuso">Multiuso (Varios)</SelectItem>
                  <SelectItem value="Futbol">Fútbol</SelectItem>
                  <SelectItem value="Baloncesto">Baloncesto</SelectItem>
                  <SelectItem value="Voleibol">Voleibol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado de Disponibilidad */}
            <div className="space-y-2">
              <Label className="font-bold">Estado de Disponibilidad</Label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 h-12 rounded-sm border cursor-pointer font-bold text-sm transition-all select-none
                  ${estado === "Disponible" 
                    ? "bg-green-500 border-green-500 text-white shadow-sm" 
                    : "bg-background/50 border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"}`}
                >
                  <input
                    type="radio"
                    name="estado"
                    value="Disponible"
                    checked={estado === "Disponible"}
                    onChange={() => setEstado("Disponible")}
                    className="sr-only"
                  />
                  Disponible
                </label>
                <label className={`flex items-center justify-center gap-2 h-12 rounded-sm border cursor-pointer font-bold text-sm transition-all select-none
                  ${estado === "No Disponible" 
                    ? "bg-red-500 border-red-500 text-white shadow-sm" 
                    : "bg-background/50 border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"}`}
                >
                  <input
                    type="radio"
                    name="estado"
                    value="No Disponible"
                    checked={estado === "No Disponible"}
                    onChange={() => setEstado("No Disponible")}
                    className="sr-only"
                  />
                  No Disponible
                </label>
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
                Escenario actualizado correctamente
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
