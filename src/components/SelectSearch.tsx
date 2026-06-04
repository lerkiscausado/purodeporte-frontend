"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaTimes, FaMapMarkerAlt, FaFutbol, FaBasketballBall, FaVolleyballBall, FaRunning } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { FaR } from "react-icons/fa6";

export interface Scenario {
  id: number;
  nombre: string;
  direccion: string;
  deporte: string;
  barrioSector?: string;
  ubicacion?: string;
}

interface SelectSearchProps {
  items: Scenario[];
  placeholder?: string;
  value?: number; // selected scenario ID as number
  onChange: (value?: number) => void;
  loading?: boolean;
  className?: string;
}

export function SelectSearch({
  items,
  placeholder = "Seleccionar...",
  value,
  onChange,
  loading = false,
  className
}: SelectSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find the selected item to display its name in the trigger
  const selectedItem = items.find((item) => item.id === value);

  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update input text when selection changes
  useEffect(() => {
    if (selectedItem) {
      setSearchTerm(selectedItem.nombre);
    } else {
      setSearchTerm("");
    }
  }, [value, selectedItem]);

  const handleInputFocus = () => {
    setIsOpen(true);
    // Clear search term on focus to let users see all options to filter
    setSearchTerm("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (itemId: number) => {
    console.log("SelectSearch - Escenario seleccionado:", itemId, "Tipo:", typeof itemId);
    if (typeof itemId !== "number") {
      console.warn("Advertencia: El ID del escenario no es un tipo numérico:", itemId);
    }
    onChange(itemId);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setSearchTerm("");
    setIsOpen(false);
  };

  // Filter items based on search term
  // If the user has a selected item and is NOT typing (or matches selection), we show all or filter
  const filteredItems = items.filter((item) => {
    // If the input matches the selected item name exactly and user is not focused/typing, show everything
    if (selectedItem && searchTerm === selectedItem.nombre) {
      return true;
    }
    const query = searchTerm.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(query) ||
      item.direccion.toLowerCase().includes(query) ||
      (item.barrioSector && item.barrioSector.toLowerCase().includes(query)) ||
      item.deporte.toLowerCase().includes(query)
    );
  });

  // Sport icons mapping
  const getSportStyles = (deporte: string) => {
    const dep = deporte.toLowerCase();
    if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer")) {
      return {
        icon: <FaFutbol className="h-4 w-4" />,
        colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
      };
    }
    if (dep.includes("basket") || dep.includes("baloncesto")) {
      return {
        icon: <FaBasketballBall className="h-4 w-4" />,
        colorClass: "bg-orange-500/10 border-orange-500/20 text-orange-500"
      };
    }
    if (dep.includes("voley") || dep.includes("voleibol")) {
      return {
        icon: <FaVolleyballBall className="h-4 w-4" />,
        colorClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
      };
    }
    return {
      icon: <FaRunning className="h-4 w-4" />,
      colorClass: "bg-blue-500/10 border-blue-500/20 text-blue-500"
    };
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          placeholder={selectedItem ? selectedItem.nombre : placeholder}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
          className="w-full bg-card h-12 border border-border/60 rounded-sm text-sm pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 p-1 rounded-full transition-colors"
              title="Limpiar selección"
            >
              <FaTimes className="h-3 w-3" />
            </button>
          )}
          <FaChevronDown
            className={cn(
              "text-muted-foreground/60 h-3.5 w-3.5 transition-transform duration-200 pointer-events-none",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-popover text-popover-foreground border border-border/80 rounded-sm shadow-xl max-h-64 overflow-y-auto animate-in fade-in-50 slide-in-from-top-1 duration-150 scrollbar-thin">
          {loading ? (
            <div className="p-4 text-center text-xs text-muted-foreground font-semibold">
              Cargando escenarios...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground font-semibold">
              {items.length === 0 ? "No tienes escenarios registrados." : "No se encontraron escenarios."}
            </div>
          ) : (
            <div className="py-1">
              {filteredItems.map((item) => {
                const isSelected = item.id === value;
                const { icon, colorClass } = getSportStyles(item.deporte);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      "flex items-start gap-3.5 w-full p-3 text-left transition-all border-b border-border/20 last:border-b-0 hover:bg-muted/45",
                      isSelected && "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary"
                    )}
                  >
                    {/* Circle icon */}
                    <div className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-full shrink-0 border",
                      colorClass
                    )}>
                      {icon}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-foreground line-clamp-1 leading-tight mb-0.5">
                        {item.nombre}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 leading-tight">
                        {item.direccion}
                      </div>
                      {item.barrioSector && (
                        <div className="text-[9px] text-muted-foreground/80 font-bold uppercase tracking-wide mt-1">
                          Sector: {item.barrioSector}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
