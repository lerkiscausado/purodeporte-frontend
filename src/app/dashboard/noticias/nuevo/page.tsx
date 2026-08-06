"use client";

import { useState, useTransition } from "react";
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
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaImage,
  FaNewspaper,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { createNoticia } from "@/app/actions/noticias";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function RegistrarNoticiaPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const [deporte, setDeporte] = useState<string>("Futbol");
  const [descripcionHtml, setDescripcionHtml] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!deporte) {
      setError("Debes seleccionar el deporte de la noticia.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("deporte", deporte);

    startTransition(async () => {
      const result = await createNoticia(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/noticias");
          router.refresh();
        }, 1200);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Cabecera */}
      <div>
        <Link
          href="/dashboard/noticias"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Volver a Noticias
        </Link>
        <h1 className="text-3xl font-black tracking-tight uppercase">Publicar Nueva Noticia</h1>
        <p className="text-muted-foreground text-sm">
          Ingresa la información requerida para agregar un nuevo artículo de prensa a la plataforma.
        </p>
      </div>

      <Card className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/15 p-6">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <FaNewspaper className="text-primary" /> Contenido del Artículo
          </CardTitle>
          <CardDescription className="text-xs">
            Las noticias publicadas aparecerán inmediatamente en el portal público de Puro Deporte.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo" className="font-bold text-sm">Título de la Noticia</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ej. Gran final del torneo de fútbol se jugará este domingo"
                required
                className="bg-card h-12 border-border/60 rounded-sm text-sm"
              />
            </div>

            {/* Subtítulo */}
            <div className="space-y-2">
              <Label htmlFor="subtitulo" className="font-bold text-sm">Subtítulo / Resumen corto</Label>
              <Input
                id="subtitulo"
                name="subtitulo"
                placeholder="Ej. Los dos equipos invictos disputarán el título en el escenario principal."
                required
                className="bg-card h-12 border-border/60 rounded-sm text-sm"
              />
            </div>

            {/* Deporte */}
            <div className="space-y-3">
              <Label className="font-bold text-sm block">Deporte / Categoría</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDeporte("Futbol")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    deporte === "Futbol"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaFutbol className={cn("h-5 w-5 mb-1.5", deporte === "Futbol" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs font-black uppercase tracking-wider block">Fútbol</span>
                  {deporte === "Futbol" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDeporte("Baloncesto")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    deporte === "Baloncesto"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaBasketballBall className={cn("h-5 w-5 mb-1.5", deporte === "Baloncesto" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs font-black uppercase tracking-wider block">Baloncesto</span>
                  {deporte === "Baloncesto" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDeporte("Voleibol")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 rounded-sm border bg-card text-center transition-all duration-200 cursor-pointer relative overflow-hidden group",
                    deporte === "Voleibol"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaVolleyballBall className={cn("h-5 w-5 mb-1.5", deporte === "Voleibol" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs font-black uppercase tracking-wider block">Voleibol</span>
                  {deporte === "Voleibol" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                </button>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label className="font-bold text-sm">Contenido o Descripción Completa</Label>
              <RichTextEditor
                value={descripcionHtml}
                onChange={setDescripcionHtml}
                placeholder="Escribe el cuerpo completo de la noticia..."
                minHeight="200px"
              />
              {/* Hidden input so FormData picks up the HTML value */}
              <input type="hidden" name="descripcion" value={descripcionHtml} />
            </div>

            {/* Foto Destacada */}
            <div className="space-y-2">
              <Label htmlFor="foto" className="font-bold text-sm">Imagen Destacada (Opcional)</Label>
              <div className="relative">
                <Input
                  id="foto"
                  name="foto"
                  type="file"
                  accept="image/*"
                  className="bg-card file:bg-primary/10 file:text-primary file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 file:font-bold hover:file:bg-primary/20 cursor-pointer pt-2 text-xs border-border/60 rounded-sm h-12 pl-10"
                />
                <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4" />
              </div>
            </div>

            {/* Feedback */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <FaCheck className="h-4 w-4" />
                Noticia publicada exitosamente. Redirigiendo...
              </div>
            )}

            {/* Botón Submit */}
            <Button
              type="submit"
              disabled={isPending || success}
              className="w-full font-bold h-12 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none mt-2"
            >
              <FaSave className="mr-2 h-4 w-4" />
              {isPending ? "Publicando..." : "Publicar Noticia"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
