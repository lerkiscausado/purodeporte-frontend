"use client";

import { useActionState, useState } from "react";
import { resetPassword } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface ResetPasswordFormProps {
  token: string;
}

const initialState = {
  success: false,
  message: "",
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState("");

  const formAction = async (prevState: any, formData: FormData) => {
    setClientError("");
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || !confirmPassword) {
      setClientError("Por favor completa ambos campos.");
      return { success: false, message: "" };
    }

    if (password !== confirmPassword) {
      setClientError("Las contraseñas no coinciden.");
      return { success: false, message: "" };
    }

    const result = await resetPassword(token, password);
    return {
      success: result?.success || false,
      message: result?.message || "",
    };
  };

  const [state, action, isPending] = useActionState(formAction, initialState);

  if (state.success) {
    return (
      <div className="space-y-6 text-center">
        <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-500">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md text-green-600 dark:text-green-400 text-sm font-semibold leading-relaxed">
          {state.message}
        </div>
        <Link
          href="/login"
          className={cn(buttonVariants(), "w-full h-12 font-bold text-lg flex items-center justify-center")}
        >
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  const errorMessage = clientError || state.message;

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password" className="font-bold">Nueva Contraseña</Label>
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
        <Label htmlFor="confirmPassword" className="font-bold">Confirmar Nueva Contraseña</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            className="h-12 bg-background/50 border-border pr-12"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            <span className="sr-only">
              {showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </span>
          </button>
        </div>
      </div>

      {/* Lista de ayuda con requisitos del backend */}
      <div className="bg-muted/30 p-3.5 rounded-md border border-border/50 space-y-1 text-xs text-muted-foreground">
        <p className="font-bold text-foreground mb-1">Requisitos de la contraseña:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Mínimo 8 caracteres</li>
          <li>Al menos una letra mayúscula</li>
          <li>Al menos una letra minúscula</li>
          <li>Al menos un número</li>
          <li>Al menos un símbolo o carácter especial</li>
        </ul>
      </div>

      {errorMessage && (
        <div className="space-y-3">
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm font-semibold text-center leading-relaxed">
            {errorMessage}
          </div>
          {!state.success && state.message && (
            <div className="text-center">
              <Link
                href="/olvide-contrasena"
                className="text-xs font-bold text-primary hover:underline"
              >
                Solicitar un nuevo enlace de recuperación
              </Link>
            </div>
          )}
        </div>
      )}

      <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={isPending}>
        {isPending ? "Restableciendo..." : "Restablecer Contraseña"}
      </Button>
    </form>
  );
}
