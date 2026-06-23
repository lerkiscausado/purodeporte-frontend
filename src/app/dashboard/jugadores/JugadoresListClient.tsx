"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  FaUsers,
  FaPlus,
  FaMars,
  FaVenus,
  FaIdCard,
  FaRulerVertical,
  FaCalendarAlt,
  FaThLarge,
  FaList,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { EditJugadorModal } from "@/components/EditJugadorModal";
import { DeleteJugadorButton } from "@/components/DeleteJugadorButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface JugadoresListClientProps {
  initialJugadores: any[];
  totalJugadores: number;
  baseUrl: string;
  canModifyOrDelete: boolean;
}

export function JugadoresListClient({ initialJugadores, totalJugadores, baseUrl, canModifyOrDelete }: JugadoresListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");

  // Keep a local search input state so typing is fast and doesn't wait for routing
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const genderFilter = searchParams.get("gender") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const ITEMS_PER_PAGE = 15;

  // Sync local search state with search query param if it changes from outside
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounced URL updates when typing search term
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearchParam = searchParams.get("search") || "";
      if (search !== currentSearchParam) {
        if (search.length >= 4 || search.length === 0) {
          const params = new URLSearchParams(searchParams.toString());
          if (search) {
            params.set("search", search);
          } else {
            params.delete("search");
          }
          params.set("page", "1"); // Reset to page 1
          startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
          });
        } else if (currentSearchParam) {
          // Reset search parameter if search term length is under 4 characters and a search parameter is currently set
          const params = new URLSearchParams(searchParams.toString());
          params.delete("search");
          params.set("page", "1");
          startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
          });
        }
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [search, searchParams, pathname, router]);

  const handleGenderFilterChange = (newGender: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newGender && newGender !== "all") {
      params.set("gender", newGender);
    } else {
      params.delete("gender");
    }
    params.set("page", "1"); // Reset to page 1
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // The backend already returns paginated results under initialJugadores!
  const jugadores = initialJugadores;

  const totalPages = Math.ceil(totalJugadores / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get full photo URL
  const getFotoUrl = (foto: string) => {
    if (!foto) return "";
    if (foto.startsWith("http://") || foto.startsWith("https://") || foto.startsWith("data:")) {
      return foto;
    }
    const cleanFoto = foto.startsWith("/") ? foto : `/${foto}`;
    return `${baseUrl}${cleanFoto}`;
  };

  // Calculate age from birthdate
  const calcAge = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return "—";
    try {
      const birth = new Date(fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} años`;
    } catch {
      return "—";
    }
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return "—";
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      if (start > 2) {
        pages.push("...");
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push("...");
      }
      
      pages.push(totalPages);
    }
    return pages;
  };

  const getInitials = (nombre: string, apellidos: string) => {
    const first = nombre ? nombre.slice(0, 1) : "";
    const second = apellidos ? apellidos.slice(0, 1) : "";
    return (first + second).toUpperCase() || "J";
  };

  const getGradientBg = (name: string) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-rose-500 to-orange-500",
      "from-violet-600 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-blue-600 to-cyan-500",
      "from-amber-500 to-yellow-500",
      "from-fuchsia-600 to-pink-600",
    ];
    return colors[hash % colors.length];
  };

  const getGenderBanner = (genero: string) => {
    const gen = genero ? genero.toLowerCase() : "";
    if (gen === "hombre" || gen === "masculino") {
      return "from-blue-600 to-sky-500";
    }
    if (gen === "mujer" || gen === "femenino") {
      return "from-pink-500 to-rose-500";
    }
    return "from-purple-600 to-violet-500";
  };

  return (
    <div className="space-y-6">
      {/* Controles: Buscar, Filtrar y Toggles de Vista */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card p-4 rounded-sm border border-border/60 shadow-sm">
        {/* Búsqueda y Filtro */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por nombre, apellidos o identificación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-muted/20 border-border/60"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-3.5 w-3.5" />
          </div>
          
          <select
            value={genderFilter}
            onChange={(e) => handleGenderFilterChange(e.target.value)}
            className="h-10 px-3 bg-card border border-border/60 rounded-sm text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider text-xs shrink-0"
          >
            <option value="all">TODOS LOS GÉNEROS</option>
            <option value="Hombre">HOMBRE</option>
            <option value="Mujer">MUJER</option>
          </select>
        </div>

        {/* Toggles de Vista */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 border border-border/60 rounded-sm self-end md:self-auto shrink-0">
          <button
            onClick={() => setViewMode("cards")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-sm transition-all duration-150",
              viewMode === "cards"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Vista de Tarjetas"
          >
            <FaThLarge className="h-3.5 w-3.5" />
            <span>Tarjetas</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-sm transition-all duration-150",
              viewMode === "table"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Vista de Tabla"
          >
            <FaList className="h-3.5 w-3.5" />
            <span>Tabla</span>
          </button>
        </div>
      </div>

      {/* Resultados de la lista */}
      {totalJugadores === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/10 rounded-sm space-y-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary/10 text-primary">
            <FaUsers className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight">No se encontraron jugadores</h3>
            <p className="text-muted-foreground text-xs mt-1">Prueba cambiando los términos de búsqueda o filtros.</p>
          </div>
        </div>
      ) : viewMode === "cards" ? (
        /* VISTA DE TARJETAS (CARDS) - ESTÉTICA PREMIUM */
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-200", isPending && "opacity-60 pointer-events-none")}>
          {jugadores.map((jugador) => {
            const fullName = `${jugador.nombre} ${jugador.apellidos}`;
            return (
              <div
                key={jugador.id}
                className="border border-border/60 rounded-sm shadow-sm overflow-hidden bg-card flex flex-col group hover:shadow-md hover:border-primary/30 transition-all duration-200 animate-in fade-in-50 duration-300"
              >
                {/* Encabezado/Banner de la Tarjeta */}
                <div className={cn(
                  "h-12 bg-gradient-to-r relative shrink-0",
                  getGenderBanner(jugador.genero)
                )}>
                  {/* Género Badge */}
                  <span className={cn(
                    "absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-black/30 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-white"
                  )}>
                    {jugador.genero === "Hombre" ? <FaMars className="h-3 w-3" /> : <FaVenus className="h-3 w-3" />}
                    {jugador.genero}
                  </span>
                </div>

                {/* Contenido Principal */}
                <div className="p-4 pt-0 flex-1 flex flex-col items-center text-center -mt-8 relative">
                  {/* Photo / Avatar */}
                  <div className="relative h-16 w-16 rounded-full bg-muted border-4 border-card shadow-md flex items-center justify-center overflow-hidden mb-2.5 shrink-0">
                    {jugador.foto ? (
                      <img
                        src={getFotoUrl(jugador.foto)}
                        alt={fullName}
                        className="absolute inset-0 h-full w-full object-cover bg-muted"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center text-lg font-black text-white bg-gradient-to-br shadow-inner uppercase",
                        getGradientBg(fullName)
                      )}>
                        {getInitials(jugador.nombre, jugador.apellidos)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="font-black text-sm uppercase text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                    {fullName}
                  </h3>
                  
                  {/* Status Badge */}
                  <span className={cn(
                    "inline-flex px-1.5 py-0.5 rounded-sm border text-[8px] font-black uppercase tracking-widest mt-1.5",
                    jugador.estado === "Activo"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {jugador.estado || "Activo"}
                  </span>

                  <hr className="w-full border-border/40 my-3" />

                  {/* Player details */}
                  <div className="w-full space-y-2 text-xs text-left font-medium text-muted-foreground flex-1">
                    {/* Edad y Nacimiento */}
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                      <span className="truncate">
                        <span className="text-[9px] text-muted-foreground/50 uppercase font-black block tracking-wider -mb-0.5">Edad y Nacimiento</span>
                        <span className="font-semibold text-foreground text-[11px]">
                          {calcAge(jugador.fechaNacimiento)} ({formatDate(jugador.fechaNacimiento)})
                        </span>
                      </span>
                    </div>

                    {/* Estatura */}
                    <div className="flex items-center gap-2">
                      <FaRulerVertical className="h-3 w-3 shrink-0 text-emerald-500" />
                      <span className="truncate">
                        <span className="text-[9px] text-muted-foreground/50 uppercase font-black block tracking-wider -mb-0.5">Estatura</span>
                        <span className="font-semibold text-foreground text-[11px]">
                          {jugador.estatura ? `${jugador.estatura} m` : "Sin registro"}
                        </span>
                      </span>
                    </div>

                    {/* Identificación */}
                    <div className="flex items-center gap-2">
                      <FaIdCard className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                      <span className="truncate">
                        <span className="text-[9px] text-muted-foreground/50 uppercase font-black block tracking-wider -mb-0.5">Identificación</span>
                        <span className="font-semibold text-foreground text-[11px]">
                          {jugador.identificacion || "Sin registro"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                {canModifyOrDelete && (
                  <div className="p-3 border-t border-border/40 bg-muted/10 flex items-center justify-end gap-2.5 shrink-0">
                    <EditJugadorModal jugador={jugador} />
                    <DeleteJugadorButton
                      jugadorId={jugador.id}
                      jugadorNombre={jugador.nombre}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA DE TABLA (TABLE) */
        <div className={cn("border border-border/60 rounded-sm shadow-md overflow-hidden bg-card animate-in fade-in-50 duration-300 transition-opacity duration-200", isPending && "opacity-60 pointer-events-none")}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/10">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Género</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Edad</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nacimiento</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estatura</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identificación</th>
                  {canModifyOrDelete && (
                    <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {jugadores.map((jugador, index) => (
                  <tr
                    key={jugador.id}
                    className={`border-b border-border/40 hover:bg-muted/10 transition-colors ${index % 2 === 0 ? "" : "bg-muted/5"}`}
                  >
                    {/* Nombre */}
                    <td className="px-4 py-3">
                      <span className="font-black text-sm uppercase tracking-tight">{jugador.nombre} {jugador.apellidos}</span>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-wider
                        ${jugador.estado === "Activo"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                      >
                        {jugador.estado || "Activo"}
                      </span>
                    </td>

                    {/* Género */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-wider
                        ${jugador.genero === "Hombre"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : "bg-pink-500/10 text-pink-500 border-pink-500/20"
                        }`}
                      >
                        {jugador.genero === "Hombre"
                          ? <FaMars className="h-3 w-3" />
                          : <FaVenus className="h-3 w-3" />
                        }
                        {jugador.genero}
                      </span>
                    </td>

                    {/* Edad */}
                    <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                      {calcAge(jugador.fechaNacimiento)}
                    </td>

                    {/* Fecha Nacimiento */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <FaCalendarAlt className="h-3 w-3 shrink-0" />
                        {formatDate(jugador.fechaNacimiento)}
                      </div>
                    </td>

                    {/* Estatura */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <FaRulerVertical className="h-3 w-3 shrink-0 text-emerald-500" />
                        {jugador.estatura} m
                      </div>
                    </td>

                    {/* Identificación */}
                    <td className="px-4 py-3">
                      {jugador.identificacion ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <FaIdCard className="h-3 w-3 shrink-0" />
                          {jugador.identificacion}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">Sin registro</span>
                      )}
                    </td>

                    {/* Acciones */}
                    {canModifyOrDelete && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <EditJugadorModal jugador={jugador} />
                          <DeleteJugadorButton
                            jugadorId={jugador.id}
                            jugadorNombre={jugador.nombre}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-sm border border-border/60 shadow-sm mt-6 animate-in fade-in-50 duration-300">
          <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Mostrando {startIndex + 1} - {Math.min(startIndex + jugadores.length, totalJugadores)} de {totalJugadores} jugadores
          </div>
          <div className="flex items-center gap-1 bg-muted/40 p-1 border border-border/60 rounded-sm">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              className={cn(
                "h-8 px-2 flex items-center justify-center text-xs font-bold uppercase rounded-sm transition-all duration-150",
                currentPage === 1
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
              title="Página Anterior"
            >
              <FaChevronLeft className="h-3 w-3 mr-1" />
              <span>Anterior</span>
            </button>

            {/* Page buttons */}
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="min-w-[32px] h-8 flex items-center justify-center text-xs font-bold text-muted-foreground/40 select-none"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(Number(page))}
                  className={cn(
                    "min-w-[32px] h-8 flex items-center justify-center text-xs font-bold rounded-sm transition-all duration-150",
                    currentPage === page
                      ? "bg-primary text-primary-foreground shadow-sm font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  )}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              className={cn(
                "h-8 px-2 flex items-center justify-center text-xs font-bold uppercase rounded-sm transition-all duration-150",
                currentPage === totalPages
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
              title="Página Siguiente"
            >
              <span>Siguiente</span>
              <FaChevronRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
