import axios from "axios";
import { Torneo, Partido, Noticia } from "@/types";
import { getUploadUrl } from "@/lib/uploads";
import { getApiUrl } from "@/lib/api-url";

// Configuración base de axios (mantenida por retrocompatibilidad)
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// MAPPERS / TRANSFORMADORES DE DATOS
// ==========================================

export function mapTorneoBackendToTorneo(item: any): Torneo {
  const fotoFilename = item.foto || item.fotoUrl || item.imagenUrl;
  const fotoCompleta = getUploadUrl("torneos", fotoFilename);

  let escenarioMapped: { nombre: string; direccion: string } | undefined;
  if (item.escenario) {
    if (typeof item.escenario === "object") {
      escenarioMapped = {
        nombre: item.escenario.nombre || item.escenario.name || "Escenario Principal",
        direccion: item.escenario.direccion || item.escenario.address || "",
      };
    } else if (typeof item.escenario === "string") {
      escenarioMapped = {
        nombre: item.escenario,
        direccion: "",
      };
    }
  }

  // Mapeo de categoría/rama
  let categoria: "Masculino" | "Femenino" | "Mixto" = "Masculino";
  const rawCategoria = item.categoria || item.rama;
  if (rawCategoria) {
    if (/femenino/i.test(rawCategoria)) categoria = "Femenino";
    else if (/mixto/i.test(rawCategoria)) categoria = "Mixto";
    else categoria = "Masculino";
  }

  // Mapeo de deporte
  let deporte: Torneo["deporte"] = "Fútbol";
  const rawDeporte = item.deporte ? String(item.deporte).toLowerCase() : "";
  if (rawDeporte.includes("basket") || rawDeporte.includes("baloncesto")) deporte = "Baloncesto";
  else if (rawDeporte.includes("voley") || rawDeporte.includes("voleibol") || rawDeporte.includes("volibol")) deporte = "Voleibol";
  else if (rawDeporte.includes("golito")) deporte = "Golito";
  else if (rawDeporte.includes("futsal") || rawDeporte.includes("micro")) deporte = "Futsal";
  else if (rawDeporte.includes("beisbol") || rawDeporte.includes("béisbol")) deporte = "Beisbol";
  else if (rawDeporte.includes("futbol") || rawDeporte.includes("fútbol")) deporte = "Fútbol";
  else deporte = "Otro";

  return {
    id: String(item.id),
    nombre: item.name || item.nombre || "Torneo",
    deporte,
    fechaInicio: item.fechaInicio || new Date().toISOString(),
    fechaFin: item.fechaFin || undefined,
    categoria,
    reglamentoUrl: item.reglamento ? getUploadUrl("torneos", item.reglamento) : undefined,
    fotoUrl: fotoCompleta,
    imagenUrl: fotoCompleta,
    estado: item.estado || "Inscripciones",
    escenario: escenarioMapped,
  };
}

export function mapPartidoBackendToPartido(item: any): Partido {
  const fechaStr = item.fecha || "";
  const horaStr = item.hora || "";
  let fullDate = fechaStr;
  if (fechaStr && horaStr && !fechaStr.includes("T")) {
    fullDate = `${fechaStr}T${horaStr}`;
  }

  let estado: "Pendiente" | "En Juego" | "Finalizado" = "Pendiente";
  if (item.estado === "Finalizado") estado = "Finalizado";
  else if (item.estado === "En Juego") estado = "En Juego";
  else if (item.estado === "Programado" || item.estado === "Pendiente") estado = "Pendiente";

  const equipoLocalNombre = item.equipoLocal?.nombre || item.equipoLocal?.name || item.localNombre || "Equipo Local";
  const equipoVisitanteNombre = item.equipoVisitante?.nombre || item.equipoVisitante?.name || item.visitanteNombre || "Equipo Visitante";
  const torneoNombre = item.torneo?.name || item.torneo?.nombre || item.torneoNombre || undefined;
  const deporte = item.torneo?.deporte || item.deporte || undefined;
  const categoria = item.torneo?.rama || item.torneo?.categoria || item.rama || item.categoria || undefined;

  let escenarioMapped: { nombre: string; direccion?: string } | undefined;
  if (item.escenario) {
    if (typeof item.escenario === "object") {
      escenarioMapped = {
        nombre: item.escenario.nombre || item.escenario.name || "Escenario Principal",
        direccion: item.escenario.direccion || item.escenario.barrioSector || "",
      };
    } else if (typeof item.escenario === "string") {
      escenarioMapped = {
        nombre: item.escenario,
      };
    }
  }

  return {
    id: String(item.id),
    torneoId: String(item.idTorneo || item.torneo?.id || item.torneoId || ""),
    torneoNombre,
    deporte,
    categoria,
    equipoLocal: {
      id: String(item.equipoLocal?.id || item.idEquipoLocal || "local"),
      nombre: equipoLocalNombre,
      logoUrl: getUploadUrl("equipos", item.equipoLocal?.escudo || item.equipoLocal?.logoUrl || item.equipoLocal?.logo || item.equipoLocal?.foto),
    },
    equipoVisitante: {
      id: String(item.equipoVisitante?.id || item.idEquipoVisitante || "visitante"),
      nombre: equipoVisitanteNombre,
      logoUrl: getUploadUrl("equipos", item.equipoVisitante?.escudo || item.equipoVisitante?.logoUrl || item.equipoVisitante?.logo || item.equipoVisitante?.foto),
    },
    fecha: fullDate || new Date().toISOString(),
    estado,
    marcadorLocal: item.local ?? item.marcadorLocal ?? undefined,
    marcadorVisitante: item.visitante ?? item.marcadorVisitante ?? undefined,
    tipoJuego: item.tipoJuego || "OFICIAL",
    escenario: escenarioMapped,
  };
}

export function mapNoticiaBackendToNoticia(item: any): Noticia {
  const resumen = item.subtitulo || item.descripcion || item.resumen || "";
  const fecha = item.createdAt || item.fecha || new Date().toISOString();
  const imagenUrl = getUploadUrl("noticias", item.foto || item.imagenUrl);

  return {
    id: String(item.id),
    titulo: item.titulo || item.title || "Noticia sin título",
    resumen,
    fecha,
    imagenUrl,
  };
}

// ==========================================
// MÉTODOS DEL SERVICIO (ENDPOINTS REALES)
// ==========================================

export const getTorneosGrouped = async (): Promise<any> => {
  try {
    const url = getApiUrl("torneos/public");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al consultar ${url}`);
      return { deportes: {} };
    }
    const data = await res.json();
    return data || { deportes: {} };
  } catch (error) {
    console.error("Error de red al obtener torneos agrupados:", error);
    return { deportes: {} };
  }
};

export const getTorneos = async (): Promise<Torneo[]> => {
  try {
    const grouped = await getTorneosGrouped();
    if (grouped && grouped.deportes && typeof grouped.deportes === "object") {
      const torneos: Torneo[] = [];
      for (const deporteKey of Object.keys(grouped.deportes)) {
        const ramasObj = grouped.deportes[deporteKey];
        if (ramasObj && typeof ramasObj === "object") {
          for (const ramaKey of Object.keys(ramasObj)) {
            const list = ramasObj[ramaKey];
            if (Array.isArray(list)) {
              torneos.push(...list.map(mapTorneoBackendToTorneo));
            }
          }
        }
      }
      if (torneos.length > 0) return torneos;
    }

    if (Array.isArray(grouped)) {
      return grouped.map(mapTorneoBackendToTorneo);
    }

    // Fallback secundario si /torneos/public devolvió vacío
    const url = getApiUrl("torneos");
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      return list.map(mapTorneoBackendToTorneo);
    }

    return [];
  } catch (error) {
    console.error("Error al obtener torneos:", error);
    return [];
  }
};

export const getResultados = async (): Promise<Partido[]> => {
  try {
    const url = getApiUrl("partidos/resultados");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al consultar ${url}`);
      return [];
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return list.map(mapPartidoBackendToPartido);
  } catch (error) {
    console.error("Error al obtener resultados de partidos:", error);
    return [];
  }
};

export const getProgramacion = async (): Promise<Partido[]> => {
  try {
    const url = getApiUrl("partidos/programacion");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al consultar ${url}`);
      return [];
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return list.map(mapPartidoBackendToPartido);
  } catch (error) {
    console.error("Error al obtener programación de partidos:", error);
    return [];
  }
};

export const getNoticias = async (): Promise<Noticia[]> => {
  try {
    const url = getApiUrl("noticias/public");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al consultar ${url}`);
      return [];
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return list.map(mapNoticiaBackendToNoticia);
  } catch (error) {
    console.error("Error al obtener noticias públicas:", error);
    return [];
  }
};

export const getTorneoById = async (id: number): Promise<Torneo | null> => {
  try {
    const url = `${getApiUrl()}/torneos/${id}/public`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      if (res.status !== 404) {
        console.error(`Error HTTP ${res.status} al consultar ${url}`);
      }
      return null;
    }
    const data = await res.json();
    if (!data) return null;
    return { ...data, ...mapTorneoBackendToTorneo(data) };
  } catch (error) {
    console.error(`Error de red al obtener torneo con ID ${id}:`, error);
    return null;
  }
};

export const getInscripcionesByTorneo = async (torneoId: number): Promise<any[]> => {
  try {
    const url = `${getApiUrl()}/inscripciones/torneo/${torneoId}/public`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al consultar ${url}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error(`Error de red al obtener inscripciones del torneo ${torneoId}:`, error);
    return [];
  }
};

export const getPartidosByTorneo = async (torneoId: number): Promise<Partido[]> => {
  try {
    const url = `${getApiUrl()}/partidos/torneo/${torneoId}/public`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al consultar ${url}`);
      return [];
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return list.map((item: any) => ({ ...item, ...mapPartidoBackendToPartido(item) }));
  } catch (error) {
    console.error(`Error de red al obtener partidos del torneo ${torneoId}:`, error);
    return [];
  }
};

export default api;

