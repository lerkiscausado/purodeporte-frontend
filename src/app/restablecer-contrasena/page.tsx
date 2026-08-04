import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { ResetPasswordForm } from "./ResetPasswordForm";

interface RestablecerContrasenaPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function RestablecerContrasenaPage({ searchParams }: RestablecerContrasenaPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 py-8">
        <Card className="w-full max-w-md shadow-2xl border-border/50 text-center">
          <CardHeader className="space-y-4 flex flex-col items-center justify-center text-center pb-6 border-b border-border/40">
            <Image
              src="/purodeporte.png"
              alt="Puro Deporte"
              width={220}
              height={55}
              className="h-12 w-auto object-contain mb-2"
            />
            <CardTitle className="text-xl font-bold text-destructive flex items-center gap-2 justify-center">
              <XCircle className="h-6 w-6 text-destructive shrink-0" />
              Enlace Inválido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <p className="text-sm font-medium text-muted-foreground">
              El enlace de recuperación no es válido o falta el token de verificación.
            </p>
            <Link
              href="/olvide-contrasena"
              className={cn(buttonVariants(), "w-full h-12 font-bold text-lg flex items-center justify-center")}
            >
              Solicitar nuevo enlace
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            Ingresa tu nueva contraseña para actualizar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
