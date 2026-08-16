export interface ColumnDefinition {
  key: string;
  label: string;
  tipoId?: number;
  isPoints?: boolean;
}

export interface TipoEstadisticaLike {
  id: number | string;
  nombre: string;
  codigo?: string;
}

/**
 * Retorna las columnas fijas por deporte según la lógica establecida:
 * - Fútbol / Microfútbol / Golito / Soccer: Goles, Faltas, Tarjeta Amarilla, Tarjeta Roja
 * - Baloncesto / Basket: T2, T3, TL, Pts
 * - Voleibol / Volleyball: Remates, Saques, Bloqueos, Pts
 * - Fallback genérico: tipos disponibles + Pts
 */
export function getColumnsForSport(
  deporte: string = "",
  tiposEstadistica: TipoEstadisticaLike[] = []
): ColumnDefinition[] {
  const dep = (deporte || "").toLowerCase().trim();

  const findTipo = (predicate: (nombre: string) => boolean) => {
    return tiposEstadistica.find((t) => predicate((t.nombre || "").toLowerCase().trim()));
  };

  if (
    dep.includes("futbol") ||
    dep.includes("fútbol") ||
    dep.includes("soccer") ||
    dep.includes("microfutbol") ||
    dep.includes("microfútbol") ||
    dep.includes("golito")
  ) {
    // Fútbol / Microfutbol / Golito: Goles | Faltas | Tarjeta Amarilla | Tarjeta Roja
    const golTipo = findTipo((n) => n === "gol" || n.includes("gol"));
    const faltaTipo = findTipo((n) => n.includes("falta"));
    const amarillaTipo = findTipo((n) => n.includes("amarill"));
    const rojaTipo = findTipo((n) => n.includes("roj"));

    return [
      { key: "goles", label: "Goles", tipoId: golTipo?.id ? Number(golTipo.id) : undefined },
      { key: "faltas", label: "Faltas", tipoId: faltaTipo?.id ? Number(faltaTipo.id) : undefined },
      { key: "amarillas", label: "Tarjeta Amarilla", tipoId: amarillaTipo?.id ? Number(amarillaTipo.id) : undefined },
      { key: "rojas", label: "Tarjeta Roja", tipoId: rojaTipo?.id ? Number(rojaTipo.id) : undefined },
    ];
  }

  if (dep.includes("baloncesto") || dep.includes("basket")) {
    // Baloncesto: T2 | T3 | TL | Pts
    const t2Tipo = findTipo((n) => n.includes("campo") || n.includes("t2") || n.includes("doble") || n.includes("2 puntos"));
    const t3Tipo = findTipo((n) => n.includes("triple") || n.includes("t3") || n.includes("3 puntos"));
    const tlTipo = findTipo((n) => n.includes("libre") || n.includes("tl") || n.includes("1 punto"));

    return [
      { key: "t2", label: "T2", tipoId: t2Tipo?.id ? Number(t2Tipo.id) : undefined },
      { key: "t3", label: "T3", tipoId: t3Tipo?.id ? Number(t3Tipo.id) : undefined },
      { key: "tl", label: "TL", tipoId: tlTipo?.id ? Number(tlTipo.id) : undefined },
      { key: "pts", label: "Pts", isPoints: true },
    ];
  }

  if (dep.includes("voley") || dep.includes("voleibol") || dep.includes("volleyball")) {
    // Voleibol: Remates | Saques | Bloqueos | Pts
    const remateTipo = findTipo((n) => n.includes("remate"));
    const saqueTipo = findTipo((n) => n.includes("saque") || n.includes("ace"));
    const bloqueoTipo = findTipo((n) => n.includes("bloqueo"));

    return [
      { key: "remates", label: "Remates", tipoId: remateTipo?.id ? Number(remateTipo.id) : undefined },
      { key: "saques", label: "Saques", tipoId: saqueTipo?.id ? Number(saqueTipo.id) : undefined },
      { key: "bloqueos", label: "Bloqueos", tipoId: bloqueoTipo?.id ? Number(bloqueoTipo.id) : undefined },
      { key: "pts", label: "Pts", isPoints: true },
    ];
  }

  // Fallback genérico para otros deportes
  const genericCols: ColumnDefinition[] = tiposEstadistica.map((t) => ({
    key: `stat-${t.id}`,
    label: t.nombre,
    tipoId: Number(t.id),
  }));
  genericCols.push({ key: "pts", label: "Pts", isPoints: true });
  return genericCols;
}

/**
 * Extrae la lista de tipos de estadísticas presentes en la respuesta cruda de getEstadisticasPorPartido
 */
export function extractTiposFromStats(stats: any[] = []): TipoEstadisticaLike[] {
  const map = new Map<number | string, { id: number | string; nombre: string }>();
  for (const item of stats) {
    for (const st of item.estadisticas || []) {
      const id = st.tipoEstadisticaId ?? st.tipo?.id ?? st.id_tipo ?? st.tipoEstadistica?.id;
      const nombre =
        (typeof st.tipo === "object" ? st.tipo?.nombre : undefined) ||
        (typeof st.tipo === "string" ? st.tipo : undefined) ||
        st.tipoEstadistica?.nombre ||
        st.nombre ||
        "";
      if (id != null && nombre && !map.has(id)) {
        map.set(id, { id: Number(id) || id, nombre });
      }
    }
  }
  return Array.from(map.values());
}

/**
 * Suma acumulativa de la cantidad de eventos de un tipo de estadística para un jugador/fila
 */
export function getStatQuantity(row: any, col: ColumnDefinition): number {
  if (col.isPoints) return 0;
  const estadisticas = row.estadisticas || [];
  const matching = estadisticas.filter((st: any) => {
    const stId = Number(st.tipoEstadisticaId ?? st.tipo?.id ?? st.id_tipo ?? st.tipoEstadistica?.id);
    if (col.tipoId && stId === col.tipoId) {
      return true;
    }
    // Fallback de matching por nombre si no se resolvió tipoId
    const stNombre = (
      (typeof st.tipo === "object" ? st.tipo?.nombre : undefined) ||
      (typeof st.tipo === "string" ? st.tipo : undefined) ||
      st.tipoEstadistica?.nombre ||
      st.nombre ||
      ""
    ).toLowerCase().trim();

    if (col.key === "goles" && (stNombre === "gol" || stNombre.includes("gol"))) return true;
    if (col.key === "faltas" && stNombre.includes("falta")) return true;
    if (col.key === "amarillas" && stNombre.includes("amarill")) return true;
    if (col.key === "rojas" && stNombre.includes("roj")) return true;
    if (col.key === "t2" && (stNombre.includes("campo") || stNombre.includes("t2") || stNombre.includes("doble") || stNombre.includes("2 puntos"))) return true;
    if (col.key === "t3" && (stNombre.includes("triple") || stNombre.includes("t3") || stNombre.includes("3 puntos"))) return true;
    if (col.key === "tl" && (stNombre.includes("libre") || stNombre.includes("tl") || stNombre.includes("1 punto"))) return true;
    if (col.key === "remates" && stNombre.includes("remate")) return true;
    if (col.key === "saques" && (stNombre.includes("saque") || stNombre.includes("ace"))) return true;
    if (col.key === "bloqueos" && stNombre.includes("bloqueo")) return true;

    return false;
  });

  return matching.reduce(
    (sum: number, st: any) => sum + (Number(st.cantidad) || 0),
    0
  );
}
