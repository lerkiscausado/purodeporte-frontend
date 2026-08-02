import { ProgramacionPublicListClient } from "./ProgramacionPublicListClient";
import { getProgramacion } from "@/services/api";

export const dynamic = "force-dynamic";

export default async function ProgramacionPage() {
  const programacion = await getProgramacion();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-3">
        <span className="bg-primary w-3 h-10 rounded-full inline-block"></span>
        Programación de Partidos
      </h1>

      <ProgramacionPublicListClient initialProgramacion={programacion} />
    </div>
  );
}
