"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  FaMapMarkerAlt, 
  FaCheck, 
  FaArrowLeft,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaRunning
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createEscenario } from "@/app/actions/escenarios";

export default function RegistrarEscenarioPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [deporte, setDeporte] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    if (!deporte) {
      setError("Debes seleccionar un deporte principal.");
      return;
    }
    formData.set("deporte", deporte);

    startTransition(async () => {
      const result = await createEscenario(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/escenarios");
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/dashboard/escenarios" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
          >
            <FaArrowLeft className="h-3 w-3" /> Volver a Escenarios
          </Link>
          <h1 className="text-3xl font-black tracking-tight uppercase">Registrar Escenario</h1>
          <p className="text-muted-foreground text-sm">Añade canchas, coliseos o complejos donde se jugarán las competencias.</p>
        </div>
      </div>

      <Card className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/15 p-6">
          <CardTitle className="text-lg font-black uppercase tracking-tight">Datos del Escenario Deportivo</CardTitle>
          <CardDescription className="text-xs">Los escenarios creados estarán disponibles de inmediato para programar partidos.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nombre del escenario */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="font-bold">Nombre del Escenario</Label>
              <Input 
                id="nombre" 
                name="nombre" 
                placeholder="Ej. Cancha Múltiple La Bombonera" 
                required 
                className="bg-card h-12 border-border/60 rounded-sm" 
              />
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="direccion" className="font-bold">Dirección Exacta</Label>
              <Input 
                id="direccion" 
                name="direccion" 
                placeholder="Ej. Calle 45 #12-34" 
                required 
                className="bg-card h-12 border-border/60 rounded-sm" 
              />
            </div>

            {/* Barrio / Sector */}
            <div className="space-y-2">
              <Label htmlFor="barrioSector" className="font-bold">Barrio / Sector</Label>
              <Input 
                id="barrioSector" 
                name="barrioSector" 
                placeholder="Ej. Barrio Sur, Sector Las Palmas" 
                className="bg-card h-12 border-border/60 rounded-sm" 
              />
            </div>

            {/* Enlace de Ubicación en Mapa */}
            <div className="space-y-2">
              <Label htmlFor="ubicacion" className="font-bold">Enlace de Ubicación (Google Maps / GPS)</Label>
              <Input 
                id="ubicacion" 
                name="ubicacion" 
                placeholder="Ej. https://maps.app.goo.gl/..." 
                className="bg-card h-12 border-border/60 rounded-sm" 
              />
              <span className="text-[10px] text-muted-foreground block mt-1">
                Tip: Ve a Google Maps, busca el lugar, haz clic en &quot;Compartir&quot; y copia el enlace aquí.
              </span>
            </div>

            {/* Deporte Principal */}
            <div className="space-y-3">
              <Label className="font-bold text-sm">Deporte Principal</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Multiuso */}
                <button
                  type="button"
                  onClick={() => setDeporte("Multiuso")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    deporte === "Multiuso"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center mb-2.5 transition-colors shrink-0",
                    deporte === "Multiuso"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                  )}>
                    <FaRunning className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider block">Multiuso</span>
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold leading-normal block">
                    Varios Deportes
                  </span>
                  {deporte === "Multiuso" && (
                    <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />
                  )}
                </button>

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
                    "h-10 w-10 rounded-full flex items-center justify-center mb-2.5 transition-colors shrink-0",
                    deporte === "Futbol"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                  )}>
                    <FaFutbol className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider block">Fútbol</span>
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold leading-normal block">
                    Cancha / Sintética
                  </span>
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
                    "h-10 w-10 rounded-full flex items-center justify-center mb-2.5 transition-colors shrink-0",
                    deporte === "Baloncesto"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                  )}>
                    <FaBasketballBall className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider block">Baloncesto</span>
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold leading-normal block">
                    Coliseo / Tablado
                  </span>
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
                    "h-10 w-10 rounded-full flex items-center justify-center mb-2.5 transition-colors shrink-0",
                    deporte === "Voleibol"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                  )}>
                    <FaVolleyballBall className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider block">Voleibol</span>
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold leading-normal block">
                    Placa / Playa
                  </span>
                  {deporte === "Voleibol" && (
                    <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />
                  )}
                </button>
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
                Escenario registrado exitosamente. Redirigiendo...
              </div>
            )}

            {/* Botón guardar */}
            <Button 
              type="submit" 
              disabled={isPending || success}
              className="w-full font-bold h-12 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none mt-2"
            >
              <FaMapMarkerAlt className="mr-2 h-4 w-4" /> 
              {isPending ? "Registrando..." : "Registrar Escenario"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
