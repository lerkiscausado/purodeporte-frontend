"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  FaSave, 
  FaArrowLeft, 
  FaCheck, 
  FaTrophy, 
  FaCalendarAlt, 
  FaFilePdf, 
  FaImage, 
  FaMapMarkerAlt, 
  FaFutbol, 
  FaBasketballBall, 
  FaVolleyballBall, 
  FaMars, 
  FaVenus, 
  FaUsers 
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getEscenarios } from "@/app/actions/escenarios";
import { createTorneo } from "@/app/actions/torneos";
import { SelectSearch } from "@/components/SelectSearch";


export default function RegistrarTorneoPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Controlled states for select dropdowns
  const [deporte, setDeporte] = useState<string>("");
  const [rama, setRama] = useState<string>("");
  const [idEscenario, setIdEscenario] = useState<number | undefined>(undefined);

  // Scenarios state
  const [escenarios, setEscenarios] = useState<any[]>([]);
  const [loadingEscenarios, setLoadingEscenarios] = useState<boolean>(true);

  const router = useRouter();

  // Load scenarios on mount
  useEffect(() => {
    async function loadEscenarios() {
      try {
        const result = await getEscenarios();
        if (result.success && result.data) {
          setEscenarios(result.data);
        } else {
          console.error("Error al cargar escenarios:", result.error);
        }
      } catch (err) {
        console.error("Excepción al cargar escenarios:", err);
      } finally {
        setLoadingEscenarios(false);
      }
    }
    loadEscenarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Form validation
    if (!deporte) {
      setError("Debes seleccionar una disciplina deportiva.");
      return;
    }
    if (!rama) {
      setError("Debes seleccionar la rama o categoría de género del torneo.");
      return;
    }
    if (!idEscenario) {
      setError("Debes seleccionar el escenario principal.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("deporte", deporte);
    formData.set("rama", rama);
    formData.set("idEscenario", idEscenario.toString());

    const start = formData.get("fechaInicio") as string;
    const end = formData.get("fechaFin") as string;
    if (start && end && new Date(start) > new Date(end)) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    startTransition(async () => {
      const result = await createTorneo(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/torneos");
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
          href="/dashboard/torneos" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Torneos
        </Link>
        <h1 className="text-3xl font-black tracking-tight uppercase">Registrar Nuevo Torneo</h1>
        <p className="text-muted-foreground text-sm">Completa la información para aperturar una nueva competición oficial.</p>
      </div>

      <Card className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/15 p-6">
          <CardTitle className="text-lg font-black uppercase tracking-tight">Información del Torneo</CardTitle>
          <CardDescription className="text-xs">Los torneos creados aparecerán inmediatamente en el panel de control de organizadores.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nombre del Torneo */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold text-sm">Nombre del Torneo</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Ej. Copa Verano 2026" 
                required 
                className="bg-card h-12 border-border/60 rounded-sm text-sm" 
              />
            </div>

            {/* Disciplina Deportiva */}
            <div className="space-y-3">
              <Label className="font-bold text-sm block">Deporte / Disciplina</Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold leading-normal block">11 vs 11</span>
                  {deporte === "Futbol" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
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
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold leading-normal block">Cancha / Rápido</span>
                  {deporte === "Baloncesto" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
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
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold leading-normal block">Placa / Playa</span>
                  {deporte === "Voleibol" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                </button>

                {/* Microfútbol */}
                <button
                  type="button"
                  onClick={() => setDeporte("Microfutbol")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    deporte === "Microfutbol"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center mb-2.5 transition-colors shrink-0",
                    deporte === "Microfutbol"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                  )}>
                    <FaFutbol className="h-5 w-5 text-sky-500" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider block">Microfútbol</span>
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold leading-normal block">Salón / Rápido</span>
                  {deporte === "Microfutbol" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                </button>

                {/* Golito */}
                <button
                  type="button"
                  onClick={() => setDeporte("Golito")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    deporte === "Golito"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center mb-2.5 transition-colors shrink-0",
                    deporte === "Golito"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                  )}>
                    <FaFutbol className="h-5 w-5 text-amber-500" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider block">Golito</span>
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold leading-normal block">Calle / Recreativo</span>
                  {deporte === "Golito" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                </button>
              </div>
            </div>

            {/* Rama / Género */}
            <div className="space-y-3">
              <Label className="font-bold text-sm block">Rama / Categoría</Label>
              <div className="grid grid-cols-3 gap-3">
                {/* Masculino */}
                <button
                  type="button"
                  onClick={() => setRama("Masculino")}
                  className={cn(
                    "flex items-center justify-center gap-2.5 h-12 rounded-sm border bg-card transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    rama === "Masculino"
                      ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaMars className={cn("h-4 w-4 shrink-0 transition-colors", rama === "Masculino" ? "text-blue-500" : "text-muted-foreground")} />
                  <span className="text-xs font-black uppercase tracking-wider block">Masculino</span>
                  {rama === "Masculino" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-blue-500" />}
                </button>

                {/* Femenino */}
                <button
                  type="button"
                  onClick={() => setRama("Femenino")}
                  className={cn(
                    "flex items-center justify-center gap-2.5 h-12 rounded-sm border bg-card transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    rama === "Femenino"
                      ? "border-pink-500 bg-pink-500/5 ring-1 ring-pink-500/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaVenus className={cn("h-4 w-4 shrink-0 transition-colors", rama === "Femenino" ? "text-pink-500" : "text-muted-foreground")} />
                  <span className="text-xs font-black uppercase tracking-wider block">Femenino</span>
                  {rama === "Femenino" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-pink-500" />}
                </button>

                {/* Mixto */}
                <button
                  type="button"
                  onClick={() => setRama("Mixto")}
                  className={cn(
                    "flex items-center justify-center gap-2.5 h-12 rounded-sm border bg-card transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    rama === "Mixto"
                      ? "border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaUsers className={cn("h-4 w-4 shrink-0 transition-colors", rama === "Mixto" ? "text-purple-500" : "text-muted-foreground")} />
                  <span className="text-xs font-black uppercase tracking-wider block">Mixto</span>
                  {rama === "Mixto" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-purple-500" />}
                </button>
              </div>
            </div>

            {/* Escenario Deportivo Principal */}
            <div className="space-y-2">
              <Label className="font-bold text-sm">Escenario Principal</Label>
              <SelectSearch
                items={escenarios}
                placeholder="Selecciona el escenario principal..."
                value={idEscenario}
                onChange={(val) => {
                  console.log("Form - Escenario seleccionado:", val, "Tipo:", typeof val);
                  if (val !== undefined && typeof val !== "number") {
                    console.error("Error en Form: El ID recibido no es de tipo numérico:", val);
                  }
                  setIdEscenario(val);
                }}
                loading={loadingEscenarios}
              />
              {escenarios.length === 0 && !loadingEscenarios && (
                <p className="text-[10px] text-destructive mt-1 font-semibold">
                  No tienes escenarios creados. Debes registrar al menos uno en la sección de{" "}
                  <Link href="/dashboard/escenarios/nuevo" className="text-primary hover:underline font-bold">
                    Escenarios
                  </Link>{" "}
                  para poder registrar un torneo.
                </p>
              )}
            </div>


            {/* Fechas de inicio y fin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio" className="font-bold text-sm">Fecha de Inicio</Label>
                <div className="relative">
                  <Input 
                    id="fechaInicio" 
                    name="fechaInicio" 
                    type="date" 
                    required 
                    className="bg-card h-12 border-border/60 rounded-sm pl-10 text-sm" 
                  />
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin" className="font-bold text-sm">Fecha Estimada de Fin</Label>
                <div className="relative">
                  <Input 
                    id="fechaFin" 
                    name="fechaFin" 
                    type="date" 
                    required
                    className="bg-card h-12 border-border/60 rounded-sm pl-10 text-sm" 
                  />
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Logo / Banner y Reglamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Foto / Banner */}
              <div className="space-y-2">
                <Label htmlFor="foto" className="font-bold text-sm">Foto o Logo del Torneo (Opcional)</Label>
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

              {/* Reglamento */}
              <div className="space-y-2">
                <Label htmlFor="reglamento" className="font-bold text-sm">Reglamento Oficial (PDF — Opcional)</Label>
                <div className="relative">
                  <Input 
                    id="reglamento" 
                    name="reglamento" 
                    type="file" 
                    accept=".pdf" 
                    className="bg-card file:bg-primary/10 file:text-primary file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 file:font-bold hover:file:bg-primary/20 cursor-pointer pt-2 text-xs border-border/60 rounded-sm h-12 pl-10" 
                  />
                  <FaFilePdf className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Mensajes de Feedback */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <FaCheck className="h-4 w-4" />
                Torneo registrado exitosamente. Redirigiendo...
              </div>
            )}

            {/* Botón Guardar */}
            <Button 
              type="submit" 
              disabled={isPending || success}
              className="w-full font-bold h-12 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none mt-2"
            >
              <FaSave className="mr-2 h-4 w-4" /> 
              {isPending ? "Registrando Torneo..." : "Guardar Torneo"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
