"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { ResendVerificationForm } from "@/app/verificar-correo/ResendVerificationForm";

const initialState = {
  error: "",
};

export function LoginFormClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const formAction = async (prevState: any, formData: FormData) => {
    const result = await login(formData);
    return { error: result?.error || "" };
  };

  const [state, action, isPending] = useActionState(formAction, initialState);

  const isEmailVerificationError =
    state.error && state.error.toLowerCase().includes("verificar tu correo electrónico");

  return (
    <form action={action} className="space-y-6">
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

      {state.error && (
        <div className="space-y-3">
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm font-semibold text-center">
            {state.error}
          </div>
          {isEmailVerificationError && (
            <div className="text-center pt-1">
              {!showResend ? (
                <button
                  type="button"
                  onClick={() => setShowResend(true)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  ¿No recibiste el correo? Reenviar enlace de verificación
                </button>
              ) : (
                <div className="p-4 bg-muted/20 border border-border/50 rounded-md">
                  <ResendVerificationForm />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={isPending}>
        {isPending ? "Ingresando..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}
