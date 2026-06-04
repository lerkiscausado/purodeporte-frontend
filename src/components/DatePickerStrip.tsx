"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaRegCalendarAlt, FaChevronDown } from "react-icons/fa";

interface DatePickerStripProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export function DatePickerStrip({ selectedDate, onChange }: DatePickerStripProps) {
  // Inicializar currentWeekStart en el domingo de la semana de la fecha seleccionada
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - day; // Ajustar a domingo
    const sunday = new Date(d.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Alinear el inicio de la semana cuando la fecha seleccionada cambia externamente
  useEffect(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const sunday = new Date(d.setDate(diff));
    sunday.setHours(0, 0, 0, 0);

    const currentStart = new Date(currentWeekStart);
    currentStart.setHours(0, 0, 0, 0);

    if (sunday.getTime() !== currentStart.getTime()) {
      setCurrentWeekStart(sunday);
    }
  }, [selectedDate]);

  // Generar los 7 días de la semana a partir de currentWeekStart
  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleCalendarClick = () => {
    const input = hiddenInputRef.current;
    if (!input) return;
    try {
      const anyInput = input as any;
      if (typeof anyInput.showPicker === "function") {
        anyInput.showPicker();
      } else {
        anyInput.click();
      }
    } catch {
      (input as any).click();
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split("-").map(Number);
      const newDate = new Date(year, month - 1, day);
      newDate.setHours(0, 0, 0, 0);
      onChange(newDate);
    }
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  // Nombres en inglés para coincidir con la estética premium deportiva de la imagen si se desea,
  // pero los ponemos abreviados en inglés para mayor fidelidad a la imagen.
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const displayMonth = monthNames[selectedDate.getMonth()];
  const displayYear = selectedDate.getFullYear();

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatInputDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-background border border-border/60 px-6 py-4 rounded-sm shadow-sm gap-4 select-none">
      {/* Mes, Año y Selector en Calendario */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-base font-black tracking-tight text-foreground uppercase">
          {displayMonth} {displayYear}
        </span>
        <button
          onClick={handleCalendarClick}
          className="flex items-center gap-1.5 p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-sm transition-colors relative"
          title="Seleccionar fecha"
        >
          <FaRegCalendarAlt className="h-4.5 w-4.5" />
          <FaChevronDown className="h-2.5 w-2.5 opacity-60" />
          <input
            ref={hiddenInputRef}
            type="date"
            value={formatInputDate(selectedDate)}
            onChange={handleNativeDateChange}
            className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
          />
        </button>
      </div>

      {/* Flechas y Carrusel de Días */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Botón Atrás */}
        <button
          onClick={handlePrevWeek}
          className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all shrink-0"
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>

        {/* Listado de Días */}
        <div className="flex items-center justify-around gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto py-1">
          {days.map((date, idx) => {
            const active = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            return (
              <button
                key={idx}
                onClick={() => onChange(date)}
                className={`flex flex-col items-center py-2 px-3.5 min-w-[3.4rem] rounded-sm transition-all relative border-b-2
                  ${active 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-transparent text-muted-foreground/80 hover:text-foreground hover:bg-muted/40"
                  }`}
              >
                <span className="text-[10px] font-bold tracking-wider">
                  {dayNames[date.getDay()]}
                </span>
                <span className="text-base font-black tracking-tight mt-0.5">
                  {date.getDate()}
                </span>
                {isToday && !active && (
                  <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={handleNextWeek}
          className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all shrink-0"
        >
          <FaChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
