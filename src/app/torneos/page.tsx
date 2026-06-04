import { CardTorneo } from "@/components/CardTorneo";
import { getTorneos } from "@/services/api";

export default async function TorneosPage() {
  const torneos = await getTorneos();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-3">
        <span className="bg-primary w-3 h-10 rounded-full inline-block"></span>
        Torneos Activos
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {torneos.map((torneo) => (
          <CardTorneo key={torneo.id} torneo={torneo} />
        ))}
      </div>
    </div>
  );
}
