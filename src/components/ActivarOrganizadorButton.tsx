"use client";

import { useTransition } from "react";
import { activarOrganizador } from "@/app/actions/auth";
import { Trophy, ArrowRight } from "lucide-react";

export function ActivarOrganizadorButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await activarOrganizador();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="w-full inline-flex items-center justify-center gap-2 h-14 px-8 bg-primary text-primary-foreground font-black text-base uppercase tracking-wide rounded-sm shadow-md hover:bg-primary/90 active:bg-primary/80 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <Trophy className="h-5 w-5" />
      {isPending ? "Activando cuenta..." : "Activar cuenta de Organizador"}
      {!isPending && <ArrowRight className="h-4 w-4 ml-1" />}
    </button>
  );
}
