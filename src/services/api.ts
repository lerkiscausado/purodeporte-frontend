import axios from "axios";
import { Torneo, Partido, Noticia } from "@/types";
import { getUploadUrl } from "@/lib/uploads";

// Configuración base de axios (mantenida por retrocompatibilidad)
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Obtiene la URL base limpia de la API asegurando que no termine en '/'
 */
function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  return apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
}

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

  return {
    id: String(item.id),
    torneoId: String(item.idTorneo || item.torneo?.id || item.torneoId || ""),
    equipoLocal: {
      id: String(item.equipoLocal?.id || item.idEquipoLocal || "local"),
      nombre: equipoLocalNombre,
      logoUrl: getUploadUrl("equipos", item.equipoLocal?.escudo || item.equipoLocal?.logoUrl || item.equipoLocal?.logo),
    },
    equipoVisitante: {
      id: String(item.equipoVisitante?.id || item.idEquipoVisitante || "visitante"),
      nombre: equipoVisitanteNombre,
      logoUrl: getUploadUrl("equipos", item.equipoVisitante?.escudo || item.equipoVisitante?.logoUrl || item.equipoVisitante?.logo),
    },
    fecha: fullDate || new Date().toISOString(),
    estado,
    marcadorLocal: item.local ?? item.marcadorLocal ?? undefined,
    marcadorVisitante: item.visitante ?? item.marcadorVisitante ?? undefined,
    tipoJuego: item.tipoJuego || "OFICIAL",
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
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/torneos/public`, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al consultar /torneos/public`);
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
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/torneos`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(mapTorneoBackendToTorneo);
      }
    }

    return [];
  } catch (error) {
    console.error("Error al obtener torneos:", error);
    return [];
  }
};

export const getResultados = async (): Promise<Partido[]> => {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/partidos/resultados`, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al consultar /partidos/resultados`);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapPartidoBackendToPartido);
  } catch (error) {
    console.error("Error al obtener resultados de partidos:", error);
    return [];
  }
};

export const getProgramacion = async (): Promise<Partido[]> => {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/partidos/programacion`, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al consultar /partidos/programacion`);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapPartidoBackendToPartido);
  } catch (error) {
    console.error("Error al obtener programación de partidos:", error);
    return [];
  }
};

export const getNoticias = async (): Promise<Noticia[]> => {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/noticias/public`, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al consultar /noticias/public`);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapNoticiaBackendToNoticia);
  } catch (error) {
    console.error("Error al obtener noticias públicas:", error);
    return [];
  }
};

export default api;
