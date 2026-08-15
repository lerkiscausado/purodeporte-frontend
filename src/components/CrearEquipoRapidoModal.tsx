"use client";

import { useState, useTransition, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FaUsers,
  FaCheck,
  FaTimes,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaImage,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaSpinner,
} from "react-icons/fa";
import { createEquipo } from "@/app/actions/equipos";
import { cn } from "@/lib/utils";

interface CrearEquipoRapidoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nombreInicial?: string;
  deporteSugerido?: string;
  onCreado: (equipo: any) => void;
}

const DEPORTES_DISPONIBLES = [
  { id: "Futbol", label: "Fútbol", icon: FaFutbol },
  { id: "Baloncesto", label: "Baloncesto", icon: FaBasketballBall },
  { id: "Voleibol", label: "Voleibol", icon: FaVolleyballBall },
];

export function CrearEquipoRapidoModal({
  open,
  onOpenChange,
  nombreInicial = "",
  deporteSugerido = "Futbol",
  onCreado,
}: CrearEquipoRapidoModalProps) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [representante, setRepresentante] = useState("");
  const [deporte, setDeporte] = useState("Futbol");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Helper para normalizar el deporte sugerido
  const normalizeDeporte = (dep?: string) => {
    if (!dep) return "Futbol";
    const d = dep.toLowerCase().trim();
    if (d.includes("futbol") || d.includes("fútbol") || d.includes("soccer") || d.includes("golito") || d.includes("microfutbol") || d.includes("futsal")) {
      return "Futbol";
    }
    if (d.includes("basket") || d.includes("baloncesto")) {
      return "Baloncesto";
    }
    if (d.includes("voley") || d.includes("voleibol") || d.includes("volleyball")) {
      return "Voleibol";
    }
    return dep;
  };

  useEffect(() => {
    if (open) {
      setNombre(nombreInicial);
      setDeporte(normalizeDeporte(deporteSugerido));
      setError(null);
      setSuccess(false);
      setFotoFile(null);
    }
  }, [open, nombreInicial, deporteSugerido]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!nombre.trim() || !representante.trim() || !deporte.trim()) {
      setError("Los campos nombre, representante y deporte son obligatorios.");
      return;
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setError("El correo electrónico debe tener un formato válido.");
      return;
    }

    const formData = new FormData();
    formData.set("nombre", nombre.trim());
    formData.set("representante", representante.trim());
    formData.set("deporte", deporte.trim());
    formData.set("estado", "Activo");

    if (telefono.trim()) {
      formData.set("telefono", telefono.trim());
    }
    if (correo.trim()) {
      formData.set("correo", correo.trim());
    }
    if (fotoFile) {
      formData.set("foto", fotoFile);
    }

    startTransition(async () => {
      const result = await createEquipo(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        const equipoCreado = result.data || {
          id: Date.now(),
          nombre: nombre.trim(),
          representante: representante.trim(),
          deporte: deporte.trim(),
          telefono: telefono.trim() || undefined,
          correo: correo.trim() || undefined,
          estado: "Activo",
        };

        onCreado(equipoCreado);

        setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
          setNombre("");
          setRepresentante("");
          setTelefono("");
          setCorreo("");
          setFotoFile(null);
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
              <FaUsers className="text-primary" />
              Creación Rápida de Equipo
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Registra un nuevo equipo para inscribirlo inmediatamente en el torneo.
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
              ¡Equipo creado y seleccionado con éxito!
            </div>
          )}

          {/* Nombre y Representante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="quick-equipo-nombre">
                Nombre del Equipo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quick-equipo-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Los Titanes F.C."
                required
                className="h-10 text-xs font-semibold"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1" htmlFor="quick-equipo-rep">
                <FaUserTie className="h-3 w-3 text-primary/70" />
                Representante / Delegado <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quick-equipo-rep"
                value={representante}
                onChange={(e) => setRepresentante(e.target.value)}
                placeholder="Ej. Carlos Mendoza"
                required
                className="h-10 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Deporte */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Deporte <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {DEPORTES_DISPONIBLES.map((d) => {
                const Icon = d.icon;
                const isSelected = deporte === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDeporte(d.id)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-2.5 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/40"
                        : "bg-card text-muted-foreground border-border/60 hover:bg-muted/40"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-primary-foreground" : "text-primary/70")} />
                    <span className="truncate">{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Teléfono y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1" htmlFor="quick-equipo-tel">
                <FaPhone className="h-3 w-3 text-primary/70" />
                Teléfono <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
              </Label>
              <Input
                id="quick-equipo-tel"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. +57 300 123 4567"
                className="h-10 text-xs font-semibold font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1" htmlFor="quick-equipo-correo">
                <FaEnvelope className="h-3 w-3 text-primary/70" />
                Correo Electrónico <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
              </Label>
              <Input
                id="quick-equipo-correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Ej. contacto@equipo.com"
                className="h-10 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Escudo / Logo (Opcional) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1" htmlFor="quick-equipo-foto">
              <FaImage className="h-3 w-3 text-primary/70" />
              Escudo del Equipo <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
            </Label>
            <Input
              id="quick-equipo-foto"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setFotoFile(file);
              }}
              className="bg-card file:bg-primary/10 file:text-primary file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 file:font-bold hover:file:bg-primary/20 cursor-pointer pt-2 text-xs border-border/60 rounded-sm h-10"
            />
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
              className="flex-1 h-11 text-xs font-black uppercase tracking-wider rounded-sm bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm cursor-pointer"
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <FaSpinner className="animate-spin h-3.5 w-3.5" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <FaUsers className="h-3.5 w-3.5" />
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
