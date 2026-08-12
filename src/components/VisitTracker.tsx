"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registrarVisita } from "@/app/actions/visitas";

/**
 * Componente invisible que registra cada navegación del usuario.
 * Se monta una sola vez en el layout raíz y reacciona a cambios de pathname.
 * Es completamente fire-and-forget: nunca bloquea el render ni muestra nada.
 */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // No esperamos la promesa ni manejamos errores aquí;
    // registrarVisita() ya los absorbe internamente.
    registrarVisita(pathname);
  }, [pathname]);

  return null;
}
