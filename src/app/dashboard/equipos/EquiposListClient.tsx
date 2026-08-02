"use client";

import { useState } from "react";
import {
  FaUserFriends,
  FaPlus,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaShieldAlt,
  FaUser,
  FaPhone,
  FaThLarge,
  FaList,
  FaSearch,
  FaEnvelope,
} from "react-icons/fa";
import { EditEquipoModal } from "@/components/EditEquipoModal";
import { DeleteEquipoButton } from "@/components/DeleteEquipoButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getUploadUrl } from "@/lib/uploads";
import Link from "next/link";

interface EquiposListClientProps {
  initialEquipos: any[];
}

export function EquiposListClient({ initialEquipos }: EquiposListClientProps) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

  // Get sport icon
  const getSportIcon = (deporte: string) => {
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer") || dep.includes("micro") || dep.includes("futsal")) {
      return <FaFutbol className="h-4 w-4 text-emerald-500" />;
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return <FaBasketballBall className="h-4 w-4 text-orange-500" />;
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return <FaVolleyballBall className="h-4 w-4 text-indigo-500" />;
    }
    return <FaShieldAlt className="h-4 w-4 text-sky-500" />;
  };

  // Get unique sports for filters
  const sports = ["all", ...Array.from(new Set(initialEquipos.map((eq) => eq.deporte)))];

  // Filter equipos
  const filteredEquipos = initialEquipos.filter((equipo) => {
    const matchesSearch =
      equipo.nombre.toLowerCase().includes(search.toLowerCase()) ||
      equipo.representante.toLowerCase().includes(search.toLowerCase());

    const matchesSport = sportFilter === "all" || equipo.deporte === sportFilter;

    return matchesSearch && matchesSport;
  });

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
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

  const getSportBanner = (deporte: string) => {
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer")) {
      return "from-emerald-600 to-teal-500";
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return "from-orange-500 to-amber-500";
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return "from-indigo-600 to-violet-500";
    }
    return "from-sky-600 to-blue-500";
  };

  return (
    <div className="space-y-6">
      {/* Controles: Buscar, Filtrar y Toggles de Vista */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card p-4 rounded-sm border border-border/60 shadow-sm">
        {/* Búsqueda y Filtro */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por nombre o representante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-muted/20 border-border/60"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-3.5 w-3.5 animate-in fade-in" />
          </div>

          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="h-10 px-3 bg-card border border-border/60 rounded-sm text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider text-xs shrink-0"
          >
            <option value="all">TODOS LOS DEPORTES</option>
            {sports.filter((s) => s !== "all").map((sport) => (
              <option key={sport} value={sport}>
                {sport.toUpperCase()}
              </option>
            ))}
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
      {filteredEquipos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-muted/10 rounded-sm space-y-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary/10 text-primary">
            <FaUserFriends className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight">No se encontraron equipos</h3>
            <p className="text-muted-foreground text-xs mt-1">Prueba cambiando los términos de búsqueda o filtros.</p>
          </div>
        </div>
      ) : viewMode === "cards" ? (
        /* VISTA DE TARJETAS (CARDS) - ESTÉTICA PREMIUM */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEquipos.map((equipo) => (
            <div
              key={equipo.id}
              className="border border-border/60 rounded-sm shadow-sm overflow-hidden bg-card flex flex-col group hover:shadow-md hover:border-primary/30 transition-all duration-200 animate-in fade-in-50 duration-300"
            >
              {/* Encabezado/Banner de la Tarjeta */}
              <div className={cn(
                "h-12 bg-gradient-to-r relative shrink-0",
                getSportBanner(equipo.deporte)
              )}>
                {/* Deporte Badge */}
                <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-black/30 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-white">
                  {getSportIcon(equipo.deporte)}
                  {equipo.deporte}
                </span>
              </div>

              {/* Contenido Principal */}
              <div className="p-4 pt-0 flex-1 flex flex-col items-center text-center -mt-8 relative">
                {/* Crest/Photo */}
                <div className="relative h-16 w-16 rounded-full bg-muted border-4 border-card shadow-md flex items-center justify-center overflow-hidden mb-2.5 shrink-0">
                  {equipo.foto ? (
                    <img
                      src={getUploadUrl("equipos", equipo.foto)}
                      alt={equipo.nombre}
                      className="absolute inset-0 h-full w-full object-cover bg-muted"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center text-lg font-black text-white bg-gradient-to-br shadow-inner uppercase",
                      getGradientBg(equipo.nombre)
                    )}>
                      {getInitials(equipo.nombre)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="font-black text-sm uppercase text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                  {equipo.nombre}
                </h3>

                {/* Status Badge */}
                <span className={cn(
                  "inline-flex px-1.5 py-0.5 rounded-sm border text-[8px] font-black uppercase tracking-widest mt-1.5",
                  equipo.estado === "Activo"
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {equipo.estado || "Activo"}
                </span>

                <hr className="w-full border-border/40 my-3" />

                {/* Contact details */}
                <div className="w-full space-y-2 text-xs text-left font-medium text-muted-foreground flex-1">
                  <div className="flex items-center gap-2">
                    <FaUser className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                    <span className="truncate">
                      <span className="text-[9px] text-muted-foreground/50 uppercase font-black block tracking-wider -mb-0.5">Representante</span>
                      <span className="font-semibold text-foreground text-[11px]">{equipo.representante}</span>
                    </span>
                  </div>

                  {equipo.telefono && (
                    <div className="flex items-center gap-2">
                      <FaPhone className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                      <a href={`tel:${equipo.telefono}`} className="hover:text-primary transition-colors truncate">
                        <span className="text-[9px] text-muted-foreground/50 uppercase font-black block tracking-wider -mb-0.5">Teléfono</span>
                        <span className="font-semibold text-foreground text-[11px]">{equipo.telefono}</span>
                      </a>
                    </div>
                  )}

                  {equipo.correo && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                      <a href={`mailto:${equipo.correo}`} className="hover:text-primary transition-colors truncate">
                        <span className="text-[9px] text-muted-foreground/50 uppercase font-black block tracking-wider -mb-0.5">Correo</span>
                        <span className="font-semibold text-foreground text-[11px]">{equipo.correo}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="p-3 border-t border-border/40 bg-muted/10 flex items-center justify-end gap-2.5 shrink-0">
                <EditEquipoModal equipo={equipo} />
                <DeleteEquipoButton
                  equipoId={equipo.id}
                  equipoNombre={equipo.nombre}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA DE TABLA (TABLE) - ESTILO ORIGINAL MEJORADO */
        <div className="border border-border/60 rounded-sm shadow-md overflow-hidden bg-card animate-in fade-in-50 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/10">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Equipo</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Representante</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Teléfono</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deporte</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipos.map((equipo, index) => (
                  <tr
                    key={equipo.id}
                    className={`border-b border-border/40 hover:bg-muted/10 transition-colors ${index % 2 === 0 ? "" : "bg-muted/5"}`}
                  >
                    {/* Equipo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 rounded-sm bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs uppercase overflow-hidden shrink-0">
                          {getSportIcon(equipo.deporte)}
                          {equipo.foto && (
                            <img
                              src={getUploadUrl("equipos", equipo.foto)}
                              alt={equipo.nombre}
                              className="absolute inset-0 h-full w-full object-cover bg-muted"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        <span className="font-black text-sm uppercase tracking-tight">{equipo.nombre}</span>
                      </div>
                    </td>

                    {/* Representante */}
                    <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <FaUser className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                        <span>{equipo.representante}</span>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                      {equipo.telefono ? (
                        <div className="flex items-center gap-1.5">
                          <FaPhone className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                          <span>{equipo.telefono}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>

                    {/* Deporte */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                        {getSportIcon(equipo.deporte)}
                        {equipo.deporte}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-wider
                        ${equipo.estado === "Activo"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                      >
                        {equipo.estado || "Activo"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <EditEquipoModal equipo={equipo} />
                        <DeleteEquipoButton
                          equipoId={equipo.id}
                          equipoNombre={equipo.nombre}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
