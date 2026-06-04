"use client";

import { useActionState, useState } from "react";
import { register } from "@/app/actions/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

const initialState = {
  error: "",
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Manejo de estado del formulario mediante useActionState (React 19+)
  const formAction = async (prevState: any, formData: FormData) => {
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
          <CardDescription className="text-base mt-2 font-medium">
            Crea una nueva cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form action={action} className="space-y-6">
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
            ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Inicia Sesión</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
