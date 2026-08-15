"use client";

import { useState, useTransition, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FaUserPlus,
  FaCheck,
  FaTimes,
  FaMars,
  FaVenus,
  FaIdCard,
  FaCalendarAlt,
  FaRulerVertical,
  FaSpinner,
} from "react-icons/fa";
import { createJugador } from "@/app/actions/jugadores";
import { cn } from "@/lib/utils";

interface CrearJugadorRapidoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nombreInicial?: string;
  onCreado: (jugador: any) => void;
  generoSugerido?: string;
}

export function CrearJugadorRapidoModal({
  open,
  onOpenChange,
  nombreInicial = "",
  onCreado,
  generoSugerido,
}: CrearJugadorRapidoModalProps) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [apellidos, setApellidos] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [estatura, setEstatura] = useState("");
  const [genero, setGenero] = useState("Hombre");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setNombre(nombreInicial);
      if (generoSugerido) {
        const g = generoSugerido.toLowerCase();
        if (g === "femenino" || g === "mujer") setGenero("Mujer");
        else if (g === "masculino" || g === "hombre") setGenero("Hombre");
      }
      setError(null);
      setSuccess(false);
    }
  }, [open, nombreInicial, generoSugerido]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!nombre.trim() || !apellidos.trim() || !identificacion.trim() || !fechaNacimiento || !estatura) {
      setError("Todos los campos obligatorios deben ser completados.");
      return;
    }

    const estaturaNum = parseFloat(estatura);
    if (isNaN(estaturaNum) || estaturaNum <= 0) {
      setError("La estatura debe ser un número válido (ej. 1.75).");
      return;
    }

    const formData = new FormData();
    formData.set("nombre", nombre.trim());
    formData.set("apellidos", apellidos.trim());
    formData.set("genero", genero);
    formData.set("fechaNacimiento", fechaNacimiento);
    formData.set("estatura", estaturaNum.toString());
    formData.set("identificacion", identificacion.trim());
    formData.set("estado", "Activo");

    startTransition(async () => {
      const result = await createJugador(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        const jugadorCreado = result.data || {
          id: Date.now(),
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          genero,
          fechaNacimiento,
          estatura: estaturaNum,
          identificacion: identificacion.trim(),
          estado: "Activo",
        };

        onCreado(jugadorCreado);

        setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
          setNombre("");
          setApellidos("");
          setIdentificacion("");
          setFechaNacimiento("");
          setEstatura("");
        }, 600);
      }
    });
  };

  return (
    <div
      className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-card w-full max-w-lg border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-xl overflow-hidden transition-all duration-300 transform ${
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-border/60 p-5 bg-muted/15">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <FaUserPlus className="text-primary" />
              Creación Rápida de Deportista
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Registra al nuevo deportista para inscribirlo inmediatamente en la planilla.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-sm cursor-pointer"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Alertas */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive font-semibold text-xs leading-normal">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-sm text-green-500 font-semibold text-xs flex items-center justify-center gap-2">
              <FaCheck className="h-3.5 w-3.5" />
              ¡Deportista creado y seleccionado con éxito!
            </div>
          )}

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="quick-nombre">
                Nombres <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quick-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Carlos"
                required
                className="h-10 text-xs font-semibold"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="quick-apellidos">
                Apellidos <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quick-apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Pérez Gomez"
                required
                className="h-10 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Identificación y Género */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1" htmlFor="quick-identificacion">
                <FaIdCard className="h-3 w-3 text-primary/70" />
                Identificación (C.C / T.I) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quick-identificacion"
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                placeholder="Ej. 1098765432"
                required
                className="h-10 text-xs font-semibold font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Género <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2 h-10">
                <button
                  type="button"
                  onClick={() => setGenero("Hombre")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-3 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                    genero === "Hombre"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border/60 hover:bg-muted/40"
                  )}
                >
                  <FaMars className="h-3.5 w-3.5 text-sky-400" />
                  Hombre
                </button>
                <button
                  type="button"
                  onClick={() => setGenero("Mujer")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-3 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                    genero === "Mujer"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border/60 hover:bg-muted/40"
                  )}
                >
                  <FaVenus className="h-3.5 w-3.5 text-pink-400" />
                  Mujer
                </button>
              </div>
            </div>
          </div>

          {/* Fecha de Nacimiento y Estatura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1" htmlFor="quick-fechaNacimiento">
                <FaCalendarAlt className="h-3 w-3 text-primary/70" />
                Fecha de Nacimiento <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quick-fechaNacimiento"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                required
                className="h-10 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1" htmlFor="quick-estatura">
                <FaRulerVertical className="h-3 w-3 text-primary/70" />
                Estatura (metros) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quick-estatura"
                type="number"
                step="0.01"
                min="0.5"
                max="2.5"
                value={estatura}
                onChange={(e) => setEstatura(e.target.value)}
                placeholder="Ej. 1.78"
                required
                className="h-10 text-xs font-semibold font-mono"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 text-xs font-bold uppercase tracking-wider rounded-sm"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || success}
              className="flex-1 h-11 text-xs font-black uppercase tracking-wider rounded-sm bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <FaSpinner className="animate-spin h-3.5 w-3.5" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <FaUserPlus className="h-3.5 w-3.5" />
                  Crear y Seleccionar
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
