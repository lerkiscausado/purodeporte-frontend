import { verifyEmail } from "@/app/actions/auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { ResendVerificationForm } from "./ResendVerificationForm";

interface VerificarCorreoPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerificarCorreoPage({ searchParams }: VerificarCorreoPageProps) {
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
              Enlace de verificación inválido.
            </p>
            <Link
              href="/login"
              className={cn(buttonVariants(), "w-full h-12 font-bold text-lg flex items-center justify-center")}
            >
              Ir a Iniciar Sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const result = await verifyEmail(token);

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
          {result.success ? (
            <>
              <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-500">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl font-black text-foreground">
                ¡Correo verificado!
              </CardTitle>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto text-destructive">
                <AlertCircle className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl font-black text-foreground">
                No se pudo verificar tu correo
              </CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            {result.message}
          </p>

          {result.success ? (
            <Link
              href="/login"
              className={cn(buttonVariants(), "w-full h-12 font-bold text-lg flex items-center justify-center")}
            >
              Iniciar Sesión
            </Link>
          ) : (
            <div className="pt-2 border-t border-border/40 text-left">
              <p className="text-xs font-semibold text-muted-foreground mb-1 text-center">
                ¿Deseas recibir un nuevo enlace de verificación?
              </p>
              <ResendVerificationForm />
            </div>
          )}
        </CardContent>
        {result.success && (
          <CardFooter className="justify-center border-t border-border/40 pt-6">
            <p className="text-sm text-muted-foreground font-medium">
              Ya puedes acceder a todas las funcionalidades de Puro Deporte.
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
