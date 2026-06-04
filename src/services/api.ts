import axios from "axios";
import { Torneo, Partido, Noticia } from "@/types";

// Configuración base de axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// MOCK DATA PARA DESARROLLO INICIAL
// ==========================================

const mockTorneos: Torneo[] = [
  {
    id: "1",
    nombre: "Copa Verano Barrio Sur",
    deporte: "Fútbol",
    fechaInicio: "2026-05-15",
    categoria: "Masculino",
    estado: "Inscripciones",
    fotoUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
    imagenUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
    escenario: {
      nombre: "Cancha de Fútbol — Los Calamares",
      direccion: "Cl. 27 #97"
    }
  },
  {
    id: "2",
    nombre: "Torneo plus 45 Manga",
    deporte: "Baloncesto",
    fechaInicio: "2026-04-01",
    categoria: "Masculino",
    estado: "En Juego",
    fotoUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
    imagenUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
    escenario: {
      nombre: "Coliseo Cubierto Bernardo Caraballo",
      direccion: "Paseo Bolívar, Carrera 17 #35-119 22"
    }
  },
  {
    id: "3",
    nombre: "Torneo Relámpago Vóley Copa Wakanda",
    deporte: "Voleibol",
    fechaInicio: "2026-03-10",
    fechaFin: "2026-03-12",
    categoria: "Mixto",
    estado: "Finalizado",
    fotoUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=600&auto=format&fit=crop",
    imagenUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=600&auto=format&fit=crop",
    escenario: {
      nombre: "Coliseo De Voleibol Norton Madrid",
      direccion: "Cl. 27 #97"
    }
  },
  {
    id: "4",
    nombre: "Torneo Golito plus 40 de Chile",
    deporte: "Golito",
    fechaInicio: "2026-02-10",
    fechaFin: "2026-05-12",
    categoria: "Femenino",
    estado: "En Juego",
    fotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop",
    imagenUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop",
  },
];


const mockResultados: Partido[] = [
  {
    id: "101",
    torneoId: "2",
    equipoLocal: { id: "eq1", nombre: "Los Halcones" },
    equipoVisitante: { id: "eq2", nombre: "Pumas del Norte" },
    fecha: "2026-04-26T20:00:00Z",
    estado: "Finalizado",
    marcadorLocal: 68,
    marcadorVisitante: 72,
  },
  {
    id: "102",
    torneoId: "2",
    equipoLocal: { id: "eq3", nombre: "Tigres" },
    equipoVisitante: { id: "eq4", nombre: "Leones" },
    fecha: "2026-04-27T19:30:00Z",
    estado: "En Juego",
    marcadorLocal: 45,
    marcadorVisitante: 40,
  },
];

const mockProgramacion: Partido[] = [
  {
    id: "103",
    torneoId: "2",
    equipoLocal: { id: "eq5", nombre: "Águilas" },
    equipoVisitante: { id: "eq6", nombre: "Búhos" },
    fecha: "2026-04-30T18:00:00Z",
    estado: "Pendiente",
  },
  {
    id: "104",
    torneoId: "1",
    equipoLocal: { id: "eq7", nombre: "Deportivo Sur" },
    equipoVisitante: { id: "eq8", nombre: "Atlético Norte" },
    fecha: "2026-05-16T15:00:00Z",
    estado: "Pendiente",
  },
];

const mockNoticias: Noticia[] = [
  {
    id: "n1",
    titulo: "Abiertas las inscripciones para la Copa Verano",
    resumen: "Participa con tu equipo en el torneo más esperado del año. Cupos limitados para fútbol 11.",
    fecha: "2026-04-28",
    imagenUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "n2",
    titulo: "Final de infarto en la Liga Nocturna",
    resumen: "Pumas del Norte vence en el último segundo a Los Halcones con un triple impresionante.",
    fecha: "2026-04-27",
    imagenUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "n3",
    titulo: "Nuevo récord en el torneo de natación regional",
    resumen: "El nadador Carlos Mejía rompe el récord de los 100 metros libre con un tiempo de 48.3 segundos.",
    fecha: "2026-04-26",
    imagenUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "n4",
    titulo: "Arranca la temporada de voleibol playero",
    resumen: "Doce duplas confirmadas para el circuito de verano. Las competencias inician el próximo fin de semana.",
    fecha: "2026-04-25",
    imagenUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=600&auto=format&fit=crop",
  },
];

// ==========================================
// MÉTODOS DEL SERVICIO (USANDO MOCKS POR AHORA)
// ==========================================

export const getTorneos = async (): Promise<Torneo[]> => {
  // Simular retardo de red
  return new Promise((resolve) => setTimeout(() => resolve(mockTorneos), 800));
};

export const getResultados = async (): Promise<Partido[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockResultados), 600));
};

export const getProgramacion = async (): Promise<Partido[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockProgramacion), 700));
};

export const getNoticias = async (): Promise<Noticia[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockNoticias), 500));
};

export default api;
