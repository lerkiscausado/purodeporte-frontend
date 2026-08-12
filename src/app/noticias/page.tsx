import { getNoticias } from "@/services/api";
import { NoticiasPublicListClient } from "./NoticiasPublicListClient";
import { FaNewspaper } from "react-icons/fa";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const noticias = await getNoticias();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-3">
        <span className="bg-primary w-3 h-10 rounded-full inline-block"></span>
        <FaNewspaper className="h-8 w-8 text-primary" />
        Noticias Deportivas
      </h1>

      <NoticiasPublicListClient initialNoticias={noticias} />
    </div>
  );
}
