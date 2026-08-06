"use client";

import { useActionState, useState } from "react";
import { register } from "@/app/actions/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Trophy, Heart, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState = {
  error: "",
};

type TipoUsuario = "organizador" | "seguidor";

const TIPO_OPTIONS: {
  value: TipoUsuario;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
  activeBg: string;
  activeRing: string;
  activeBorder: string;
  accentBar: string;
  iconBg: string;
}[] = [
  {
    value: "organizador",
    label: "Organizador de Torneos",
    sublabel: "Crea y administra tus propios torneos, equipos, jugadores y partidos.",
    icon: Trophy,
    color: "text-primary",
    activeBg: "bg-primary/5",
    activeRing: "ring-1 ring-primary/40",
    activeBorder: "border-primary",
    accentBar: "bg-primary",
    iconBg: "bg-primary/15",
  },
  {
    value: "seguidor",
    label: "Seguidor / Aficionado",
    sublabel: "Sigue tus equipos y torneos favoritos, entérate de resultados y programación.",
    icon: Heart,
    color: "text-rose-400",
    activeBg: "bg-rose-500/5",
    activeRing: "ring-1 ring-rose-400/40",
    activeBorder: "border-rose-400",
    accentBar: "bg-rose-400",
    iconBg: "bg-rose-400/15",
  },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>("seguidor");

  const formAction = async (prevState: any, formData: FormData) => {
    formData.set("tipoUsuario", tipoUsuario);
    const result = await register(formData);
    return { error: result?.error || "" };
  };

  const [state, action, isPending] = useActionState(formAction, initialState);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="space-y-4 flex flex-col items-center justify-center text-center pb-6 border-b border-border/40">
          <Image
            src="/purodeporte.png"
            alt="Puro Deporte"
            width={220}
            height={55}
            className="h-12 w-auto object-contain mb-2"
          />
          <p className="text-base mt-2 font-medium text-muted-foreground">
            Crea una nueva cuenta
          </p>
        </CardHeader>
        <CardContent className="pt-8">
          <form action={action} className="space-y-6">

            {/* ── Tipo de cuenta ── */}
            <div className="space-y-2">
              <Label className="font-bold text-sm block">
                ¿Cómo usarás Puro Deporte?
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {TIPO_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = tipoUsuario === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTipoUsuario(opt.value)}
                      className={cn(
                        "relative flex items-start gap-4 p-4 rounded-sm border text-left transition-all duration-200 cursor-pointer overflow-hidden w-full",
                        isSelected
                          ? cn("border-2", opt.activeBorder, opt.activeBg, opt.activeRing, "shadow-sm")
                          : "border border-border/60 bg-card hover:border-border hover:bg-muted/10"
                      )}
                    >
                      {/* Top accent line */}
                      {isSelected && (
                        <div className={cn("absolute top-0 left-0 right-0 h-0.5", opt.accentBar)} />
                      )}

                      {/* Icon */}
                      <div
                        className={cn(
                          "shrink-0 h-10 w-10 rounded-sm flex items-center justify-center transition-colors",
                          isSelected ? opt.iconBg : "bg-muted/30"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isSelected ? opt.color : "text-muted-foreground"
                          )}
                        />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "font-black text-sm uppercase tracking-tight block leading-tight",
                            isSelected ? "text-foreground" : "text-foreground/80"
                          )}
                        >
                          {opt.label}
                        </span>
                        <span className="text-xs text-muted-foreground leading-snug mt-1 block">
                          {opt.sublabel}
                        </span>
                      </div>

                      {/* Check */}
                      <CheckCircle2
                        className={cn(
                          "shrink-0 self-center h-5 w-5 transition-all duration-150",
                          isSelected ? opt.color : "text-muted-foreground/20"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hidden field — FormData always carries the selected tipo */}
            <input type="hidden" name="tipoUsuario" value={tipoUsuario} />

            {/* ── Nombre ── */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">Nombre Completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Ej. Juan Pérez"
                required
                className="h-12 bg-background/50 border-border"
              />
            </div>

            {/* ── Email ── */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ejemplo@correo.com"
                required
                className="h-12 bg-background/50 border-border"
              />
            </div>

            {/* ── Teléfono ── */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-bold">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Ej. 3001234567"
                required
                className="h-12 bg-background/50 border-border"
              />
            </div>

            {/* ── Contraseña ── */}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-12 bg-background/50 border-border pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  <span className="sr-only">
                    {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </span>
                </button>
              </div>
            </div>

            {/* ── Confirmar Contraseña ── */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-bold">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-12 bg-background/50 border-border pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  <span className="sr-only">
                    {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </span>
                </button>
              </div>
            </div>

            {/* ── Error ── */}
            {state.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm font-semibold text-center">
                {state.error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={isPending}>
              {isPending ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/40 pt-6">
          <p className="text-sm text-muted-foreground font-medium">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
