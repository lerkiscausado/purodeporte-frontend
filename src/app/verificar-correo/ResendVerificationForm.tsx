"use client";

import { useActionState } from "react";
import { resendVerification } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ResendVerificationFormProps {
  defaultEmail?: string;
}

const initialState = {
  message: "",
};

export function ResendVerificationForm({ defaultEmail = "" }: ResendVerificationFormProps) {
  const formAction = async (prevState: any, formData: FormData) => {
    const email = formData.get("email") as string;
    const res = await resendVerification(email);
    return { message: res?.message || "" };
  };

  const [state, action, isPending] = useActionState(formAction, initialState);

  return (
    <form action={action} className="space-y-4 w-full mt-4 text-left">
      <div className="space-y-2">
        <Label htmlFor="resend-email" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
          Correo Electrónico
        </Label>
        <Input
          id="resend-email"
          name="email"
          type="email"
          defaultValue={defaultEmail}
          placeholder="ejemplo@correo.com"
          required
          className="h-11 bg-background/50 border-border"
        />
      </div>

      {state.message && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-600 dark:text-green-400 text-xs font-semibold text-center">
          {state.message}
        </div>
      )}

      <Button type="submit" className="w-full h-11 font-bold text-sm" disabled={isPending}>
        {isPending ? "Enviando..." : "Reenviar enlace de verificación"}
      </Button>
    </form>
  );
}
