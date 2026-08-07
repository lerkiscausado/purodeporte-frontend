import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { FaUserCircle, FaEnvelope, FaPhone, FaShieldAlt, FaCalendarAlt, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt } from "react-icons/fa";
import { Trophy } from "lucide-react";
import { EditProfileModal } from "@/components/EditProfileModal";
import { ActivarOrganizadorButton } from "@/components/ActivarOrganizadorButton";
import { getUploadUrl } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) {
    redirect("/login");
  }

  const userDataCookie = cookieStore.get("user_data");

  let user = {
    id: 0,
    name: "Usuario",
    email: "",
    phone: "",
    genero: "",
    fechaNacimiento: "",
    direccion: "",
    foto: "",
    role: "user",
    createdAt: "",
    updatedAt: "",
  };

  if (userDataCookie?.value) {
    try {
      user = JSON.parse(userDataCookie.value);
    } catch { }
  }

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    user: "Usuario",
    manager: "Manager",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/15 text-red-400 border-red-500/20",
    user: "bg-primary/15 text-primary border-primary/20",
    manager: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-3xl flex-1">
      {/* Seguidor Banner + Activation CTA (solo si role === 'user') */}
      {user.role === "user" && (
        <div className="bg-card border border-border/60 border-l-4 border-l-primary rounded-sm p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-sm bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Trophy className="h-3.5 w-3.5" />
              Cuenta Seguidor / Aficionado
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
              ¿Quieres organizar tus propios torneos?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Activa tu cuenta de Organizador para crear torneos, inscribir equipos, administrar jugadores y publicar resultados.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <ActivarOrganizadorButton />
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">Mi Perfil</h1>
        <p className="text-muted-foreground text-sm">Información de tu cuenta en Puro Deporte.</p>
      </div>

      {/* Card principal del perfil */}
      <Card className="border-y border-r border-border/60 border-l-4 border-l-primary/70 rounded-sm shadow-md overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-[oklch(0.25_0.05_255)] relative border-b border-border/60">
          <div className="absolute -bottom-10 left-6">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-background border-2 border-border/60 shadow-md overflow-hidden">
              {user.foto ? (
                <img
                  src={getUploadUrl("perfiles", user.foto)}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaUserCircle className="h-12 w-12 text-primary" />
              )}
            </div>
          </div>
        </div>

        {/* Info principal */}
        <CardContent className="pt-14 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">{user.name}</h2>
              <span className={`inline-block mt-1 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${roleColors[user.role] || roleColors.user}`}>
                {roleLabels[user.role] || user.role}
              </span>
            </div>
            <EditProfileModal 
              userName={user.name} 
              userPhone={user.phone} 
              userFoto={user.foto}
              userGenero={user.genero}
              userFechaNacimiento={user.fechaNacimiento}
              userDireccion={user.direccion}
            />
          </div>

          {/* Datos del usuario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-start gap-3 p-4 rounded-sm bg-muted/20 border-y border-r border-border/60 border-l-4 border-l-primary/70">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-primary/10 text-primary shrink-0">
                <FaEnvelope className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Correo Electrónico</p>
                <p className="text-sm font-bold truncate">{user.email || "—"}</p>
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex items-start gap-3 p-4 rounded-sm bg-muted/20 border-y border-r border-border/60 border-l-4 border-l-blue-500/70">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-blue-500/10 text-blue-500 shrink-0">
                <FaPhone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Teléfono</p>
                <p className="text-sm font-bold truncate">{user.phone || "—"}</p>
              </div>
            </div>

            {/* Género */}
            <div className="flex items-start gap-3 p-4 rounded-sm bg-muted/20 border-y border-r border-border/60 border-l-4 border-l-purple-500/70">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-purple-500/10 text-purple-500 shrink-0">
                <FaVenusMars className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Género</p>
                <p className="text-sm font-bold">{user.genero || "—"}</p>
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="flex items-start gap-3 p-4 rounded-sm bg-muted/20 border-y border-r border-border/60 border-l-4 border-l-pink-500/70">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-pink-500/10 text-pink-500 shrink-0">
                <FaBirthdayCake className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Fecha de Nacimiento</p>
                <p className="text-sm font-bold">{formatDate(user.fechaNacimiento)}</p>
              </div>
            </div>

            {/* Dirección */}
            <div className="flex items-start gap-3 p-4 rounded-sm bg-muted/20 border-y border-r border-border/60 border-l-4 border-l-emerald-500/70">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-emerald-500/10 text-emerald-500 shrink-0">
                <FaMapMarkerAlt className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Dirección</p>
                <p className="text-sm font-bold truncate" title={user.direccion || undefined}>{user.direccion || "—"}</p>
              </div>
            </div>

            {/* Rol */}
            <div className="flex items-start gap-3 p-4 rounded-sm bg-muted/20 border-y border-r border-border/60 border-l-4 border-l-amber-500/70">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-amber-500/10 text-amber-500 shrink-0">
                <FaShieldAlt className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Rol</p>
                <p className="text-sm font-bold">{roleLabels[user.role] || user.role}</p>
              </div>
            </div>

            {/* Fecha de registro */}
            <div className="flex items-start gap-3 p-4 rounded-sm bg-muted/20 border-y border-r border-border/60 border-l-4 border-l-green-500/70 col-span-1 sm:col-span-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-green-500/10 text-green-500 shrink-0">
                <FaCalendarAlt className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Miembro desde</p>
                <p className="text-sm font-bold">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
