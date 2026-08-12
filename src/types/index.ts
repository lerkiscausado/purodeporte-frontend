export interface Torneo {
  id: string;
  nombre: string;
  deporte: "Fútbol" | "Baloncesto" | "Voleibol" | "Golito" | "Futsal" | "Beisbol" | "Otro";
  fechaInicio: string;
  fechaFin?: string;
  categoria: "Masculino" | "Femenino" | "Mixto";
  reglamentoUrl?: string;
  fotoUrl?: string;
  estado: "Inscripciones" | "En Juego" | "Finalizado" | "Suspendido";
  imagenUrl?: string;
  escenario?: {
    nombre: string;
    direccion: string;
  };
}


export interface Equipo {
  id: string;
  nombre: string;
  logoUrl?: string;
  puntos: number;
  partidosJugados: number;
}

export interface Partido {
  id: string;
  torneoId: string;
  torneoNombre?: string;
  deporte?: string;
  categoria?: string;
  equipoLocal: {
    id: string;
    nombre: string;
    logoUrl?: string;
  };
  equipoVisitante: {
    id: string;
    nombre: string;
    logoUrl?: string;
  };
  fecha: string;
  estado: "Pendiente" | "En Juego" | "Finalizado" | "Cancelado";
  marcadorLocal?: number;
  marcadorVisitante?: number;
  tipoJuego?: "OFICIAL" | "AMISTOSO" | "LIGUILLA";
  escenario?: {
    nombre: string;
    direccion?: string;
  };
  /** Motivo de cancelación cuando estado === "Cancelado". Reutiliza el mismo campo descripcion del backend. */
  descripcion?: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  resumen: string;
  descripcion: string;
  fecha: string;
  imagenUrl: string;
}

export interface Jugador {
  id: string;
  tipoIdentificacion: "CC" | "TI" | "CE" | "PA";
  identificacion: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  estatura: number;
  sexo: "Masculino" | "Femenino";
  imageUrl?: string;
}