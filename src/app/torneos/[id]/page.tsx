import { getTorneoById, getInscripcionesByTorneo, getPartidosByTorneo } from "@/services/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getUploadUrl } from "@/lib/uploads";
import { TorneoDetailClient, FavoritoButton } from "./TorneoDetailClient";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaFilePdf,
  FaFutbol,
  FaBasketballBall,
  FaVolleyballBall,
  FaTrophy,
} from "react-icons/fa";

import { cookies } from "next/headers";
import { getMisFavoritos } from "@/app/actions/favoritos";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, string> = {
  "Inscripciones": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "En Juego": "bg-green-500/10 text-green-500 border-green-500/20",
  "Finalizado": "bg-muted text-muted-foreground border-border/60",
  "Suspendido": "bg-red-500/10 text-red-500 border-red-500/20",
};

const getSportIcon = (deporte: string) => {
  if (!deporte) return <FaTrophy className="h-5 w-5 text-primary" />;
  const dep = deporte.toLowerCase();
  if (dep.includes("futbol") || dep.includes("fútbol") || dep.includes("soccer") || dep.includes("futsal") || dep.includes("golito")) {
    return <FaFutbol className="h-5 w-5 text-emerald-500" />;
  }
  if (dep.includes("basket") || dep.includes("baloncesto")) {
    return <FaBasketballBall className="h-5 w-5 text-orange-500" />;
  }
  if (dep.includes("voley") || dep.includes("voleibol")) {
    return <FaVolleyballBall className="h-5 w-5 text-indigo-500" />;
  }
  return <FaTrophy className="h-5 w-5 text-primary" />;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return null;
  }
};

export default async function TorneoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const torneoId = parseInt(id, 10);

  if (isNaN(torneoId)) {
    notFound();
  }

  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get("session_token")?.value);

  const [torneo, inscripciones, partidos, misFavoritos] = await Promise.all([
    getTorneoById(torneoId),
    getInscripcionesByTorneo(torneoId),
    getPartidosByTorneo(torneoId),
    isAuthenticated ? getMisFavoritos() : Promise.resolve([]),
  ]);

  if (!torneo) {
    notFound();
  }

  const isFavorito = misFavoritos.some(
    (f: any) =>
      Number(f.id) === torneoId ||
      Number(f.torneoId) === torneoId ||
      (f.torneo && Number(f.torneo.id) === torneoId)
  );

  // Resolver reglamento PDF si existe
  const reglamentoRaw = (torneo as any).reglamento || torneo.reglamentoUrl;
  const reglamentoUrl = reglamentoRaw
    ? getUploadUrl("torneos", reglamentoRaw)
    : null;

  const fechaInicioFmt = formatDate(torneo.fechaInicio);
  const fechaFinFmt = formatDate(torneo.fechaFin);

  const escenarioNombre = torneo.escenario?.nombre || (typeof torneo.escenario === "string" ? torneo.escenario : null);
  const escenarioDireccion = torneo.escenario?.direccion || null;
  const escenarioUbicacion = (torneo.escenario as any)?.ubicacion || (torneo.escenario as any)?.location || (torneo.escenario as any)?.mapsUrl || null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Retroceso */}
      <Link
        href="/torneos"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
      >
        <FaArrowLeft className="h-3 w-3" /> Volver a Torneos
      </Link>

      {/* Header Resumen del Torneo (Información Fija) */}
      <div className="bg-card border border-border/60 rounded-sm p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
              {getSportIcon(torneo.deporte)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {torneo.deporte}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Categoría {torneo.categoria || (torneo as any).rama || "General"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
                {torneo.nombre}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm border ${
                statusColors[torneo.estado] || statusColors["Inscripciones"]
              }`}
            >
              {torneo.estado}
            </span>
            <FavoritoButton
              torneoId={Number(torneo.id)}
              initialIsFavorito={isFavorito}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>

        {/* Info Grid (Fechas, Escenario, Reglamento) */}
        <div className="pt-4 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-medium text-muted-foreground">
          {/* Fechas */}
          <div className="flex items-center gap-2.5">
            <FaCalendarAlt className="h-4 w-4 text-primary shrink-0" />
            <div>
              <span className="font-bold text-foreground block">Fechas del Torneo</span>
              {fechaInicioFmt ? (
                <span>
                  {fechaInicioFmt}
                  {fechaFinFmt && ` al ${fechaFinFmt}`}
                </span>
              ) : (
                <span className="italic">Por definir</span>
              )}
            </div>
          </div>

          {/* Escenario */}
          <div className="flex items-center gap-2.5">
            <FaMapMarkerAlt className="h-4 w-4 text-sky-500 shrink-0" />
            <div>
              <span className="font-bold text-foreground block">Escenario Principal</span>
              {escenarioNombre ? (
                <span className="truncate block" title={`${escenarioNombre} ${escenarioDireccion ? `(${escenarioDireccion})` : ""}`}>
                  {escenarioUbicacion ? (
                    <a
                      href={escenarioUbicacion}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-bold text-sky-500 hover:text-sky-400 transition-colors"
                    >
                      {escenarioNombre}
                    </a>
                  ) : (
                    <span>{escenarioNombre}</span>
                  )}
                  {escenarioDireccion && ` · ${escenarioDireccion}`}
                </span>
              ) : (
                <span className="italic">Por asignar</span>
              )}
            </div>
          </div>

          {/* Reglamento */}
          {reglamentoUrl && (
            <div className="flex items-center sm:col-span-2 lg:col-span-1">
              <a
                href={reglamentoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-sm border border-primary/20 transition-colors uppercase tracking-wider text-[11px]"
              >
                <FaFilePdf className="h-4 w-4 text-rose-500 shrink-0" />
                Ver Reglamento (PDF)
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Pestañas e Interacción del Cliente */}
      <TorneoDetailClient
        torneo={torneo}
        inscripciones={inscripciones}
        partidos={partidos}
        isFavorito={isFavorito}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
