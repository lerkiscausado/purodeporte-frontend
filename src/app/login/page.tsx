import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { LoginFormClient } from "./LoginFormClient";

interface LoginPageProps {
  searchParams: Promise<{ registered?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const showRegisteredSuccess = resolvedSearchParams.registered === "true";

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
            Inicia sesión en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          {showRegisteredSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-600 dark:text-green-400 text-sm font-semibold text-center">
              ¡Registro exitoso! Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.
            </div>
          )}
          <LoginFormClient />
        </CardContent>
        <CardFooter className="justify-center border-t border-border/40 pt-6">
          <p className="text-sm text-muted-foreground font-medium">
            ¿No tienes cuenta? <Link href="/register" className="text-primary hover:underline">Regístrate</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
