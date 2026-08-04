"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { FaUserCircle, FaUser, FaSignOutAlt, FaChevronDown, FaColumns } from "react-icons/fa";
import { logout } from "@/app/actions/auth";

import { getUploadUrl } from "@/lib/uploads";

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userRole: string;
  userFoto?: string;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  user: "Usuario",
  manager: "Manager",
};

export function UserMenu({ userName, userEmail, userRole, userFoto }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Cerrar el menú DESPUÉS de iniciar la acción, no antes
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón del usuario */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-bold bg-white/10 text-white/90 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/15 transition-colors cursor-pointer"
      >
        {userFoto ? (
          <div className="h-6 w-6 rounded-full overflow-hidden border border-white/20 shrink-0">
            <img
              src={getUploadUrl("perfiles", userFoto)}
              alt={userName}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <FaUserCircle className="h-5 w-5 text-primary" />
        )}
        <span className="max-w-[120px] truncate">{userName}</span>
        <FaChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[oklch(0.22_0.05_255)] border border-white/15 rounded-xl shadow-2xl shadow-black/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Info del usuario */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
            {userFoto ? (
              <div className="h-10 w-10 rounded-full overflow-hidden border border-white/20 shrink-0">
                <img
                  src={getUploadUrl("perfiles", userFoto)}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/10 text-primary flex items-center justify-center shrink-0 border border-white/10">
                <FaUserCircle className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{userName}</p>
              <p className="text-xs text-white/50 truncate">{userEmail}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary">
                {roleLabels[userRole] || userRole}
              </span>
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="py-1">
            <Link
              href="/dashboard/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <FaUser className="h-4 w-4" />
              Mi Perfil
            </Link>
          </div>

          {/* Panel Administrativo */}
          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <FaColumns className="h-4 w-4" />
              Panel Administrativo
            </Link>
          </div>

          {/* Cerrar sesión */}
          <div className="border-t border-white/10 py-1">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FaSignOutAlt className="h-4 w-4" />
              {isPending ? "Cerrando..." : "Cerrar Sesión"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

