"use client";

import { useState } from "react";
import { Noticia } from "@/types";
import { CardNoticia } from "@/components/CardNoticia";
import { FaFutbol, FaBasketballBall, FaVolleyballBall, FaNewspaper } from "react-icons/fa";

interface NoticiasPublicListClientProps {
  initialNoticias: Noticia[];
}

const DEPORTE_FILTERS = [
  { label: "Todas", value: "Todas", icon: FaNewspaper, color: "text-primary" },
  { label: "Fútbol", value: "Fútbol", icon: FaFutbol, color: "text-emerald-500" },
  { label: "Baloncesto", value: "Baloncesto", icon: FaBasketballBall, color: "text-orange-500" },
  { label: "Voleibol", value: "Voleibol", icon: FaVolleyballBall, color: "text-indigo-500" },
];

export function NoticiasPublicListClient({ initialNoticias }: NoticiasPublicListClientProps) {
  const [deporteFilter, setDeporteFilter] = useState("Todas");

  const normalizeStr = (str: string) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredNoticias = initialNoticias.filter((noticia) => {
    if (deporteFilter === "Todas") return true;
    if (!noticia.deporte) return false;
    const noticiaDep = normalizeStr(noticia.deporte);
    const filterDep = normalizeStr(deporteFilter);
    return noticiaDep === filterDep || noticiaDep.includes(filterDep);
  });

  return (
    <div className="space-y-6">
      {/* Chips / Tabs de Filtro por Deporte */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DEPORTE_FILTERS.map((chip) => {
          const Icon = chip.icon;
          const isSelected = deporteFilter === chip.value;

          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => setDeporteFilter(chip.value)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-200 shrink-0 border cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-primary-foreground" : chip.color}`} />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lista de Noticias o Estado Vacío */}
      {filteredNoticias.length === 0 ? (
        <div className="border border-border/60 rounded-sm bg-card p-12 text-center text-muted-foreground font-medium">
          {deporteFilter === "Todas"
            ? "No hay noticias recientes."
            : `No hay noticias en la categoría de ${deporteFilter}.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNoticias.map((noticia) => (
            <CardNoticia key={noticia.id} noticia={noticia} />
          ))}
        </div>
      )}
    </div>
  );
}
