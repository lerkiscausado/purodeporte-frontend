"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEdit, FaCheck, FaTimes, FaFutbol, FaBasketballBall, FaVolleyballBall, FaImage } from "react-icons/fa";
import { updateNoticia } from "@/app/actions/noticias";
import { getUploadUrl } from "@/lib/uploads";
import { cn } from "@/lib/utils";

interface EditNoticiaModalProps {
  noticia: {
    id: number;
    titulo: string;
    subtitulo: string;
    descripcion: string;
    deporte: string;
    foto?: string;
  };
}

export function EditNoticiaModal({ noticia }: EditNoticiaModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deporte, setDeporte] = useState(noticia.deporte || "Futbol");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set("deporte", deporte);

    startTransition(async () => {
      const result = await updateNoticia(noticia.id, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <>
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded-sm hover:bg-primary/10"
        title="Editar noticia"
      >
        <FaEdit className="h-4 w-4" />
      </button>

      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Modal Contenedor */}
        <div
          className={`bg-card w-full max-w-xl border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-xl overflow-hidden transition-all duration-300 transform max-h-[90vh] flex flex-col
            ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between border-b border-border/60 p-5 bg-muted/15 shrink-0">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                <FaEdit className="text-primary" />
                Editar Noticia
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Modifica los detalles de la noticia seleccionada.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-sm"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Formulario scrollable */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="edit-titulo" className="font-bold text-sm">Título de la Noticia</Label>
              <Input
                id="edit-titulo"
                name="titulo"
                defaultValue={noticia.titulo}
                required
                className="h-12 bg-background/50 border-border rounded-sm w-full"
              />
            </div>

            {/* Subtítulo */}
            <div className="space-y-2">
              <Label htmlFor="edit-subtitulo" className="font-bold text-sm">Subtítulo / Resumen corto</Label>
              <Input
                id="edit-subtitulo"
                name="subtitulo"
                defaultValue={noticia.subtitulo}
                required
                className="h-12 bg-background/50 border-border rounded-sm w-full"
              />
            </div>

            {/* Deporte */}
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Deporte / Categoría</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDeporte("Futbol")}
                  className={cn(
                    "flex flex-col items-center justify-center p-2.5 rounded-sm border bg-card text-center transition-all duration-150 cursor-pointer relative overflow-hidden",
                    deporte === "Futbol"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaFutbol className={cn("h-4 w-4 mb-1", deporte === "Futbol" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-[10px] font-black uppercase tracking-wider block">Fútbol</span>
                  {deporte === "Futbol" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDeporte("Baloncesto")}
                  className={cn(
                    "flex flex-col items-center justify-center p-2.5 rounded-sm border bg-card text-center transition-all duration-150 cursor-pointer relative overflow-hidden",
                    deporte === "Baloncesto"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaBasketballBall className={cn("h-4 w-4 mb-1", deporte === "Baloncesto" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-[10px] font-black uppercase tracking-wider block">Baloncesto</span>
                  {deporte === "Baloncesto" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDeporte("Voleibol")}
                  className={cn(
                    "flex flex-col items-center justify-center p-2.5 rounded-sm border bg-card text-center transition-all duration-150 cursor-pointer relative overflow-hidden",
                    deporte === "Voleibol"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-border/60 hover:border-border/100 hover:bg-muted/15"
                  )}
                >
                  <FaVolleyballBall className={cn("h-4 w-4 mb-1", deporte === "Voleibol" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-[10px] font-black uppercase tracking-wider block">Voleibol</span>
                  {deporte === "Voleibol" && <div className="absolute top-0 right-0 h-0.5 left-0 bg-primary" />}
                </button>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="edit-descripcion" className="font-bold text-sm">Contenido de la Noticia</Label>
              <textarea
                id="edit-descripcion"
                name="descripcion"
                rows={5}
                defaultValue={noticia.descripcion}
                required
                className="w-full bg-background/50 border border-border rounded-sm p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Foto (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="edit-foto" className="font-bold text-sm">Imagen Destacada (Opcional)</Label>

              {noticia.foto && (
                <div className="flex items-center gap-3 p-2 bg-muted/20 border border-border/40 rounded-sm mb-1">
                  <div className="h-12 w-20 rounded-sm bg-muted overflow-hidden relative shrink-0 border border-border/60">
                    <img
                      src={getUploadUrl("noticias", noticia.foto)}
                      alt={noticia.titulo}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Imagen actual de la noticia</span>
                </div>
              )}

              <div className="relative">
                <Input
                  id="edit-foto"
                  name="foto"
                  type="file"
                  accept="image/*"
                  className="bg-card file:bg-primary/10 file:text-primary file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 file:font-bold hover:file:bg-primary/20 cursor-pointer pt-2 text-xs border-border/60 rounded-sm h-12 pl-10"
                />
                <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Deja este campo vacío para conservar la imagen actual.
              </p>
            </div>

            {/* Mensajes de feedback */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <FaCheck className="h-4 w-4" />
                Noticia actualizada correctamente
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 font-bold rounded-sm"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 font-bold rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none"
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
