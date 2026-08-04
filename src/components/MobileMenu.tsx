"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  FaFutbol,
  FaTrophy,
  FaChartLine,
  FaCalendarAlt,
  FaNewspaper,
  FaUserCircle,
  FaColumns,
  FaSignOutAlt,
} from "react-icons/fa";
import { logout } from "@/app/actions/auth";
import { getUploadUrl } from "@/lib/uploads";

interface MobileMenuProps {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    role: string;
    foto: string;
  };
}

const navLinks = [
  { href: "/", label: "Inicio", icon: FaFutbol },
  { href: "/torneos", label: "Torneos", icon: FaTrophy },
  { href: "/resultados", label: "Resultados", icon: FaChartLine },
  { href: "/programacion", label: "Programación", icon: FaCalendarAlt },
  { href: "/noticias", label: "Noticias", icon: FaNewspaper },
];

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  user: "Usuario",
  manager: "Manager",
};

export function MobileMenu({ isAuthenticated, user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Cerrar el menú automáticamente al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <>
      {/* Botón hamburguesa / cerrar */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-white/80 hover:text-white hover:bg-white/10"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Panel móvil full-screen */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Panel de navegación */}
          <div className="fixed inset-x-0 top-16 bottom-0 z-50 bg-[oklch(0.18_0.06_255)] overflow-y-auto md:hidden animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex flex-col min-h-full">
              {/* Links de navegación */}
              <div className="px-4 pt-6 pb-2 space-y-1">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-white/70 hover:bg-white/10 hover:text-white active:bg-white/15"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </div>

              {/* Separador */}
              <div className="mx-6 my-3 border-t border-white/10" />

              {/* Sección de usuario */}
              <div className="px-4 pb-8 mt-auto">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {/* Info del usuario */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                      {user.foto ? (
                        <div className="h-11 w-11 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                          <img
                            src={getUploadUrl("perfiles", user.foto)}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-white/10 text-primary flex items-center justify-center shrink-0 border border-white/10">
                          <FaUserCircle className="h-7 w-7" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-white/50 truncate">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary">
                          {roleLabels[user.role] || user.role}
                        </span>
                      </div>
                    </div>

                    {/* Link a Dashboard */}
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 active:bg-white/15"
                    >
                      <FaColumns className="h-5 w-5 shrink-0" />
                      Panel Administrativo
                    </Link>

                    {/* Cerrar Sesión */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isPending}
                      className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-base font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 cursor-pointer disabled:opacity-50 active:bg-red-500/15"
                    >
                      <FaSignOutAlt className="h-5 w-5 shrink-0" />
                      {isPending ? "Cerrando..." : "Cerrar Sesión"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 px-2">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full font-bold rounded-full text-white hover:text-primary hover:bg-white/10 px-4 py-3 border border-white/30 hover:border-white/60 transition-colors text-base"
                      >
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      <Button
                        variant="default"
                        className="w-full font-bold rounded-full px-6 py-3 shadow-primary/25 shadow-lg text-base"
                      >
                        Registrarse
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
