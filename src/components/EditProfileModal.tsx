"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FaEdit, FaTimes, FaCheck, FaKey, FaImage, FaUserCircle } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { useRouter } from "next/navigation";
import { getUploadUrl } from "@/lib/uploads";

interface EditProfileModalProps {
  userName: string;
  userPhone: string;
  userFoto?: string;
  userGenero?: string;
  userFechaNacimiento?: string;
  userDireccion?: string;
}

export function EditProfileModal({ 
  userName, 
  userPhone,
  userFoto = "",
  userGenero = "",
  userFechaNacimiento = "",
  userDireccion = ""
}: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [genero, setGenero] = useState(userGenero);
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError("");
    setSuccess(false);

    // Adjuntar género desde el estado
    if (genero) {
      formData.set("genero", genero);
    }

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Refrescar la página para mostrar los datos actualizados
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          router.refresh();
        }, 1500);
      }
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => { setIsOpen(true); setError(""); setSuccess(false); setGenero(userGenero); }}
        className="font-bold rounded-sm px-6 gap-2 bg-primary hover:bg-primary/95 text-primary-foreground border-none"
      >
        <FaEdit className="h-4 w-4" />
        Editar Perfil
      </Button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => !isPending && setIsOpen(false)}
      >
        {/* Modal */}
        <div
          className="w-full max-w-lg bg-card border-l-4 border-l-primary border-y border-r border-border/60 rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30">
            <h3 className="text-lg font-black tracking-tight uppercase">Editar Perfil</h3>
            <button
              onClick={() => !isPending && setIsOpen(false)}
              className="p-2 rounded-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-bold">Nombre Completo</Label>
              <Input
                id="edit-name"
                name="name"
                type="text"
                defaultValue={userName}
                required
                className="h-12 bg-background/50 border-border rounded-sm"
                placeholder="Tu nombre completo"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="font-bold">Teléfono</Label>
              <Input
                id="edit-phone"
                name="phone"
                type="tel"
                defaultValue={userPhone}
                required
                className="h-12 bg-background/50 border-border rounded-sm"
                placeholder="Ej. 3001234567"
              />
            </div>

            {/* Género */}
            <div className="space-y-2">
              <Label className="font-bold">Género</Label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 h-12 rounded-sm border cursor-pointer font-bold text-sm transition-all select-none
                  ${genero === "Hombre" 
                    ? "bg-primary border-primary text-primary-foreground shadow-sm" 
                    : "bg-background/50 border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"}`}
                >
                  <input
                    type="radio"
                    name="genero"
                    value="Hombre"
                    checked={genero === "Hombre"}
                    onChange={() => setGenero("Hombre")}
                    className="sr-only"
                  />
                  Hombre
                </label>
                <label className={`flex items-center justify-center gap-2 h-12 rounded-sm border cursor-pointer font-bold text-sm transition-all select-none
                  ${genero === "Mujer" 
                    ? "bg-primary border-primary text-primary-foreground shadow-sm" 
                    : "bg-background/50 border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"}`}
                >
                  <input
                    type="radio"
                    name="genero"
                    value="Mujer"
                    checked={genero === "Mujer"}
                    onChange={() => setGenero("Mujer")}
                    className="sr-only"
                  />
                  Mujer
                </label>
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="edit-fechaNacimiento" className="font-bold">Fecha de Nacimiento</Label>
              <Input
                id="edit-fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                defaultValue={userFechaNacimiento ? userFechaNacimiento.split("T")[0] : ""}
                className="h-12 bg-background/50 border-border rounded-sm block w-full"
              />
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="edit-direccion" className="font-bold">Dirección</Label>
              <Input
                id="edit-direccion"
                name="direccion"
                type="text"
                defaultValue={userDireccion}
                className="h-12 bg-background/50 border-border rounded-sm"
                placeholder="Ej. Barrio Chile Mz25 Lote 1"
              />
            </div>

            {/* Foto de Perfil (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="edit-foto" className="font-bold text-sm">Foto de Perfil (Opcional)</Label>

              {userFoto ? (
                <div className="flex items-center gap-3 p-2 bg-muted/20 border border-border/40 rounded-sm mb-1">
                  <div className="h-10 w-10 rounded-full bg-muted overflow-hidden relative shrink-0 border border-border/60">
                    <img
                      src={getUploadUrl("perfiles", userFoto)}
                      alt={userName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Foto de perfil actual</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-2 bg-muted/20 border border-border/40 rounded-sm mb-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-border/60">
                    <FaUserCircle className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Sin foto registrada</span>
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
                Deja este campo vacío para conservar tu foto actual.
              </p>
            </div>

            {/* Separador de contraseña */}
            <div className="flex items-center gap-3 pt-2">
              <FaKey className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm font-semibold text-muted-foreground">Cambiar contraseña (opcional)</p>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Contraseña actual */}
            <div className="space-y-2">
              <Label htmlFor="edit-currentPassword" className="font-bold">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="edit-currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  className="h-12 bg-background/50 border-border pr-12"
                  placeholder="Tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="edit-newPassword" className="font-bold">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="edit-newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  className="h-12 bg-background/50 border-border pr-12 rounded-sm"
                  placeholder="Tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="edit-confirmNewPassword" className="font-bold">Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="edit-confirmNewPassword"
                  name="confirmNewPassword"
                  type={showNewPassword ? "text" : "password"}
                  className="h-12 bg-background/50 border-border pr-12 rounded-sm"
                  placeholder="Repite tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm text-green-500 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <FaCheck className="h-4 w-4" />
                Perfil actualizado exitosamente
              </div>
            )}

            {/* Botones */}
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
