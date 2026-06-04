"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  FaCheck, 
  FaTimes, 
  FaArrowLeft, 
  FaUserPlus,
  FaMars,
  FaVenus
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createJugador } from "@/app/actions/jugadores";

export default function RegistrarJugadorPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [genero, setGenero] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    if (!genero) {
      setError("Debes seleccionar el género del jugador.");
      return;
    }
    formData.set("genero", genero);

    startTransition(async () => {
      const result = await createJugador(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/jugadores");
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
          href="/dashboard/jugadores"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Jugadores
        </Link>
        <h1 className="text-3xl font-black tracking-tight uppercase">Registrar Jugador</h1>
        <p className="text-muted-foreground text-sm">Añade nuevos talentos a los equipos inscritos.</p>
      </div>

      <div className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden bg-card">
        {/* Cabecera de la tarjeta */}
        <div className="border-b border-border/60 bg-muted/15 p-6">
          <h2 className="text-lg font-black uppercase tracking-tight">Datos del Jugador</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Los campos marcados son obligatorios para el registro.</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="font-bold">Nombre(s)</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Ej. Lionel Andrés"
                required
                className="bg-background/50 h-12 border-border/60 rounded-sm"
              />
            </div>

            {/* Apellidos */}
            <div className="space-y-2">
              <Label htmlFor="apellidos" className="font-bold">Apellidos</Label>
              <Input
                id="apellidos"
                name="apellidos"
                placeholder="Ej. Messi Cuccittini"
                required
                className="bg-background/50 h-12 border-border/60 rounded-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Género */}
            <div className="space-y-3">
              <Label className="font-bold text-sm block">Género</Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Hombre */}
                <button
                  type="button"
                  onClick={() => setGenero("Hombre")}
                  className={cn(
                    "flex items-center justify-center gap-2.5 h-12 rounded-sm border bg-card transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    genero === "Hombre"
                      ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaMars className={cn("h-4 w-4 shrink-0 transition-colors", genero === "Hombre" ? "text-blue-500" : "text-muted-foreground")} />
                  <span className="text-xs font-black uppercase tracking-wider block">Hombre</span>
                  {genero === "Hombre" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-blue-500" />}
                </button>

                {/* Mujer */}
                <button
                  type="button"
                  onClick={() => setGenero("Mujer")}
                  className={cn(
                    "flex items-center justify-center gap-2.5 h-12 rounded-sm border bg-card transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    genero === "Mujer"
                      ? "border-pink-500 bg-pink-500/5 ring-1 ring-pink-500/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaVenus className={cn("h-4 w-4 shrink-0 transition-colors", genero === "Mujer" ? "text-pink-500" : "text-muted-foreground")} />
                  <span className="text-xs font-black uppercase tracking-wider block">Mujer</span>
                  {genero === "Mujer" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-pink-500" />}
                </button>
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento" className="font-bold">Fecha de Nacimiento</Label>
              <Input
                id="fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                required
                className="bg-background/50 h-12 border-border/60 rounded-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estatura */}
            <div className="space-y-2">
              <Label htmlFor="estatura" className="font-bold">Estatura (metros)</Label>
              <Input
                id="estatura"
                name="estatura"
                type="number"
                step="0.01"
                min="0.5"
                max="2.5"
                placeholder="Ej. 1.80"
                required
                className="bg-background/50 h-12 border-border/60 rounded-sm"
              />
            </div>

            {/* Identificación */}
            <div className="space-y-2">
              <Label htmlFor="identificacion" className="font-bold">Identificación <span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
              <Input
                id="identificacion"
                name="identificacion"
                placeholder="Ej. 1000222333"
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
              Jugador registrado exitosamente. Redirigiendo...
            </div>
          )}

          {/* Botón guardar */}
          <Button
            type="submit"
            disabled={isPending || success}
            className="w-full font-bold h-12 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none mt-2"
          >
            <FaUserPlus className="mr-2 h-4 w-4" />
            {isPending ? "Registrando..." : "Registrar Jugador"}
          </Button>
        </form>
      </div>
    </div>
  );
}
