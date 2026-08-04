"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/app/actions/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const initialState = {
  message: "",
};

export default function OlvideContrasenaPage() {
  const formAction = async (prevState: any, formData: FormData) => {
    const email = formData.get("email") as string;
    const res = await forgotPassword(email);
    return { message: res?.message || "" };
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
          <CardTitle className="text-xl font-bold tracking-tight">
            Recuperar Contraseña
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            Ingresa tu correo electrónico para recibir un enlace de recuperación.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ejemplo@correo.com"
                required
                className="h-12 bg-background/50 border-border"
              />
            </div>

            {state.message && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md text-green-600 dark:text-green-400 text-sm font-semibold text-center leading-relaxed">
                {state.message}
              </div>
            )}

            <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/40 pt-6">
          <Link
            href="/login"
            className="text-sm text-primary hover:underline font-bold inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Iniciar Sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
