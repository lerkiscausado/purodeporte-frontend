import { PartidoItem } from "@/components/PartidoItem";
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
      
      <div className="max-w-4xl space-y-4">
        {programacion.map((partido) => (
          <PartidoItem key={partido.id} partido={partido} />
        ))}
      </div>
    </div>
  );
}
