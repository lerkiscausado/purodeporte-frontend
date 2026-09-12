"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  FaArrowLeft,
  FaSave,
  FaCheck,
  FaImage,
  FaBullhorn,
  FaLink,
  FaCalendarAlt,
} from "react-icons/fa";
import { createPublicidad } from "@/app/actions/publicidad";

export default function NuevaPublicidadPage() {
  const router = useRouter();
  const [clientError, setClientError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(createPublicidad, null);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/dashboard/publicidad");
        router.refresh();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError(null);
    const form = e.currentTarget;
    const fechaInicio = (form.elements.namedItem("fechaInicio") as HTMLInputElement)?.value;
    const fechaFin = (form.elements.namedItem("fechaFin") as HTMLInputElement)?.value;
    const imagenInput = form.elements.namedItem("imagen") as HTMLInputElement;

    if (!imagenInput?.files || imagenInput.files.length === 0) {
      e.preventDefault();
      setClientError("La imagen del anuncio publicitario es obligatoria.");
      return;
    }

    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      e.preventDefault();
      setClientError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }
  };

  const errorMessage = clientError || state?.error;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Cabecera */}
      <div>
        <Link
          href="/dashboard/publicidad"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Publicidad
        </Link>
        <h1 className="text-3xl font-black tracking-tight uppercase">Nueva Publicidad</h1>
        <p className="text-muted-foreground text-sm">
          Registra un nuevo banner publicitario con su enlace y rango de vigencia.
        </p>
      </div>

      <Card className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/15 p-6">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <FaBullhorn className="text-primary" /> Datos del Anuncio
          </CardTitle>
          <CardDescription className="text-xs">
            Los anuncios dentro del período de vigencia aparecerán en los espacios publicitarios del portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
            {/* Imagen del anuncio - Obligatorio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="imagen" className="font-bold text-sm flex items-center gap-1.5">
                  <FaImage className="text-primary h-3.5 w-3.5" /> Imagen del Anuncio
                </Label>
                <span className="text-[11px] font-black uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded-sm">
                  Obligatorio
                </span>
              </div>

              {previewUrl && (
                <div className="p-3 bg-muted/20 border border-border/40 rounded-sm flex items-center gap-4">
                  <div className="h-20 w-20 rounded-sm bg-muted overflow-hidden relative shrink-0 border border-border/60">
                    <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">Vista previa cargada</p>
                    <p>Se utilizará esta imagen para la publicidad.</p>
                  </div>
                </div>
              )}

              <div className="relative">
                <Input
                  id="imagen"
                  name="imagen"
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleImageChange}
                  className="bg-card file:bg-primary/10 file:text-primary file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 file:font-bold hover:file:bg-primary/20 cursor-pointer pt-2 text-xs border-border/60 rounded-sm h-12 pl-10"
                />
                <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Selecciona una imagen en formato JPG, PNG o WEBP. Proporción cuadrada o rectangular recomendada.
              </p>
            </div>

            {/* Enlace de Destino */}
            <div className="space-y-2">
              <Label htmlFor="link" className="font-bold text-sm flex items-center gap-1.5">
                <FaLink className="text-primary h-3.5 w-3.5" /> Enlace de Destino (URL)
              </Label>
              <Input
                id="link"
                name="link"
                type="url"
                placeholder="https://ejemplo.com/promocion"
                required
                className="bg-card h-12 border-border/60 rounded-sm text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Dirección web a donde será redirigido el usuario al hacer clic en el anuncio.
              </p>
            </div>

            {/* Fechas de Vigencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio" className="font-bold text-sm flex items-center gap-1.5">
                  <FaCalendarAlt className="text-primary h-3.5 w-3.5" /> Fecha de Inicio
                </Label>
                <Input
                  id="fechaInicio"
                  name="fechaInicio"
                  type="date"
                  required
                  className="bg-card h-12 border-border/60 rounded-sm text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin" className="font-bold text-sm flex items-center gap-1.5">
                  <FaCalendarAlt className="text-primary h-3.5 w-3.5" /> Fecha de Fin
                </Label>
                <Input
                  id="fechaFin"
                  name="fechaFin"
                  type="date"
                  required
                  className="bg-card h-12 border-border/60 rounded-sm text-sm"
                />
              </div>
            </div>

            {/* Feedback */}
            {errorMessage && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {errorMessage}
              </div>
            )}

            {state?.success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <FaCheck className="h-4 w-4" />
                Publicidad registrada exitosamente. Redirigiendo...
              </div>
            )}

            {/* Botón Submit */}
            <Button
              type="submit"
              disabled={isPending || state?.success}
              className="w-full font-bold h-12 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none mt-2"
            >
              <FaSave className="mr-2 h-4 w-4" />
              {isPending ? "Guardando publicidad..." : "Guardar Publicidad"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
