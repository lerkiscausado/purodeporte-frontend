"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaBullhorn,
  FaPlus,
  FaSearch,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaThLarge,
  FaList,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getUploadUrl } from "@/lib/uploads";
import { EditPublicidadModal } from "@/components/EditPublicidadModal";
import { DeletePublicidadButton } from "@/components/DeletePublicidadButton";
import { Publicidad } from "@/types";

interface PublicidadListClientProps {
  initialPublicidad: Publicidad[];
}

export function PublicidadListClient({ initialPublicidad }: PublicidadListClientProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "vigente" | "proximo" | "vencido">("all");

  const getStatusInfo = (fechaInicio: string, fechaFin: string) => {
    try {
      const now = new Date();
      // Parse YYYY-MM-DD cleanly ignoring timezone shifts
      const parseLocal = (dStr: string) => {
        const [year, month, day] = dStr.split("T")[0].split("-").map(Number);
        return new Date(year, month - 1, day);
      };

      const start = parseLocal(fechaInicio);
      const end = parseLocal(fechaFin);
      end.setHours(23, 59, 59, 999);

      if (now < start) {
        return {
          key: "proximo",
          label: "Próximo",
          className: "bg-blue-500/10 text-blue-500 border-blue-500/30",
        };
      } else if (now > end) {
        return {
          key: "vencido",
          label: "Vencido",
          className: "bg-destructive/10 text-destructive border-destructive/30",
        };
      } else {
        return {
          key: "vigente",
          label: "Vigente",
          className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
        };
      }
    } catch {
      return {
        key: "vigente",
        label: "Vigente",
        className: "bg-muted text-muted-foreground border-border",
      };
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const filteredPublicidad = initialPublicidad.filter((item) => {
    const matchesSearch = (item.link || "").toLowerCase().includes(search.toLowerCase());
    const status = getStatusInfo(item.fechaInicio, item.fechaFin).key;
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FaBullhorn className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
              Gestión de Publicidad
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Administra los anuncios publicitarios, enlaces de destino y fechas de vigencia.
            </p>
          </div>
        </div>

        <Link href="/dashboard/publicidad/nuevo">
          <Button className="font-bold h-11 px-5 rounded-sm bg-primary hover:bg-primary/95 text-primary-foreground border-none w-full sm:w-auto uppercase tracking-wider text-xs">
            <FaPlus className="mr-2 h-3.5 w-3.5" /> Nueva Publicidad
          </Button>
        </Link>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card p-4 rounded-sm border border-border/60 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por enlace de destino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-muted/20 border-border/60"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-3.5 w-3.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 bg-card border border-border/60 rounded-sm text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase tracking-wider shrink-0"
          >
            <option value="all">TODOS LOS ESTADOS</option>
            <option value="vigente">VIGENTES</option>
            <option value="proximo">PRÓXIMOS</option>
            <option value="vencido">VENCIDOS</option>
          </select>
        </div>

        {/* Alternar Vista (Cards / Tabla) */}
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

      {/* Contenido Principal */}
      {filteredPublicidad.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-sm p-12 text-center text-muted-foreground text-sm font-medium">
          No se encontraron anuncios publicitarios registrados.
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPublicidad.map((item) => {
            const fotoUrl = getUploadUrl("publicidad", item.imagen);
            const status = getStatusInfo(item.fechaInicio, item.fechaFin);

            return (
              <div
                key={item.id}
                className="bg-card border border-border/60 rounded-sm overflow-hidden shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Foto de Publicidad */}
                  <div className="relative h-48 w-full bg-muted overflow-hidden border-b border-border/40">
                    <img
                      src={fotoUrl}
                      alt="Anuncio publicitario"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="outline"
                        className={cn("uppercase text-[10px] font-black px-2.5 py-0.5 shadow-sm border", status.className)}
                      >
                        {status.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Detalle */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                      <FaCalendarAlt className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        {formatDate(item.fechaInicio)} — {formatDate(item.fechaFin)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                        Enlace de Destino
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline truncate max-w-full"
                        title={item.link}
                      >
                        <span className="truncate">{item.link}</span>
                        <FaExternalLinkAlt className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-3 border-t border-border/40 bg-muted/15 flex items-center justify-between">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider"
                  >
                    Abrir link →
                  </a>

                  <div className="flex items-center gap-1">
                    <EditPublicidadModal publicidad={item} />
                    <DeletePublicidadButton publicidadId={item.id} publicidadLink={item.link} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 uppercase tracking-wider text-[10px] font-bold text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Anuncio</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Período de Vigencia</th>
                  <th className="py-3 px-3">Enlace</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {filteredPublicidad.map((item) => {
                  const fotoUrl = getUploadUrl("publicidad", item.imagen);
                  const status = getStatusInfo(item.fechaInicio, item.fechaFin);

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={fotoUrl}
                          alt="Anuncio"
                          className="h-12 w-16 object-cover rounded-sm border border-border/60 shrink-0"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-black uppercase px-2 py-0.5", status.className)}
                        >
                          {status.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(item.fechaInicio)} — {formatDate(item.fechaFin)}
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate block"
                          title={item.link}
                        >
                          {item.link}
                        </a>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditPublicidadModal publicidad={item} />
                          <DeletePublicidadButton publicidadId={item.id} publicidadLink={item.link} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
