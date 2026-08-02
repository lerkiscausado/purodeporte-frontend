"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FaCheck,
  FaArrowLeft,
  FaUsers,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaImage
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createEquipo } from "@/app/actions/equipos";

export default function RegistrarEquipoPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deporte, setDeporte] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    if (!deporte) {
      setError("Debes seleccionar el deporte del equipo.");
      return;
    }
    formData.set("deporte", deporte);

    const correo = formData.get("correo") as string;
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("El correo electrónico debe tener un formato válido.");
      return;
    }

    startTransition(async () => {
      const result = await createEquipo(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/equipos");
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Cabecera */}
      <div>
        <Link
          href="/dashboard/equipos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Equipos
        </Link>
        <h1 className="text-3xl font-black tracking-tight uppercase">Registrar Equipo</h1>
        <p className="text-muted-foreground text-sm">Crea un nuevo equipo deportivo para participar en tus competencias.</p>
      </div>

      <div className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden bg-card">
        {/* Cabecera de la tarjeta */}
        <div className="border-b border-border/60 bg-muted/15 p-6">
          <h2 className="text-lg font-black uppercase tracking-tight">Datos del Equipo</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Los campos marcados son obligatorios para el registro.</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="font-bold">Nombre del Equipo</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Ej. Real Madrid F.C."
                required
                className="bg-background/50 h-12 border-border/60 rounded-sm"
              />
            </div>

            {/* Representante */}
            <div className="space-y-2">
              <Label htmlFor="representante" className="font-bold">Representante / Delegado</Label>
              <Input
                id="representante"
                name="representante"
                placeholder="Ej. Florentino Pérez"
                required
                className="bg-background/50 h-12 border-border/60 rounded-sm"
              />
            </div>
          </div>

          {/* Deporte */}
          <div className="space-y-3">
            <Label className="font-bold text-sm block">Deporte</Label>
            <div className="grid grid-cols-3 gap-3">
              {/* Fútbol */}
              <button
                type="button"
                onClick={() => setDeporte("Futbol")}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                  deporte === "Futbol"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                    : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors shrink-0",
                  deporte === "Futbol"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                )}>
                  <FaFutbol className="h-5 w-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider block">Fútbol</span>
                {deporte === "Futbol" && (
                  <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />
                )}
              </button>

              {/* Baloncesto */}
              <button
                type="button"
                onClick={() => setDeporte("Baloncesto")}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                  deporte === "Baloncesto"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                    : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors shrink-0",
                  deporte === "Baloncesto"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                )}>
                  <FaBasketballBall className="h-5 w-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider block">Baloncesto</span>
                {deporte === "Baloncesto" && (
                  <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />
                )}
              </button>

              {/* Voleibol */}
              <button
                type="button"
                onClick={() => setDeporte("Voleibol")}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                  deporte === "Voleibol"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                    : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors shrink-0",
                  deporte === "Voleibol"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                )}>
                  <FaVolleyballBall className="h-5 w-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider block">Voleibol</span>
                {deporte === "Voleibol" && (
                  <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Más Datos del Equipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Escudo del Equipo (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="foto" className="font-bold text-sm">Escudo del Equipo (Opcional)</Label>
              <div className="relative">
                <Input
                  id="foto"
                  name="foto"
                  type="file"
                  accept="image/*"
                  className="bg-card file:bg-primary/10 file:text-primary file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 file:font-bold hover:file:bg-primary/20 cursor-pointer pt-2 text-xs border-border/60 rounded-sm h-12 pl-10"
                />
                <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4" />
              </div>
            </div>

            {/* Teléfono (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="font-bold text-sm">Teléfono<span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="Ej. +57 300 123 4567"
                className="bg-background/50 h-12 border-border/60 rounded-sm"
              />
            </div>

            {/* Correo (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="correo" className="font-bold text-sm">Correo Electrónico <span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                placeholder="Ej. contacto@equipo.com"
                className="bg-background/50 h-12 border-border/60 rounded-sm"
              />
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
              Equipo registrado exitosamente. Redirigiendo...
            </div>
          )}

          {/* Botón guardar */}
          <Button
            type="submit"
            disabled={isPending || success}
            className="w-full font-bold h-12 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none mt-2"
          >
            <FaUsers className="mr-2 h-4 w-4" />
            {isPending ? "Registrando..." : "Registrar Equipo"}
          </Button>
        </form>
      </div>
    </div>
  );
}
