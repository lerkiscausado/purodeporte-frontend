import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaTrophy, FaUsers, FaChartLine, FaExclamationTriangle, FaUserCircle } from "react-icons/fa";

export default async function DashboardHome() {
  // Leer datos del usuario desde la cookie
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("user_data");

  let user = { name: "Usuario", email: "", role: "user", phone: "" };
  if (userDataCookie?.value) {
    try {
      user = JSON.parse(userDataCookie.value);
    } catch { }
  }

  // Mapear roles a etiquetas legibles
  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    user: "Usuario",
    manager: "Manager",
  };

  return (
    <div className="space-y-8">
      {/* Saludo y datos del usuario */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">¡Hola, {user.name}!</h1>
          <p className="text-muted-foreground">Bienvenido al panel de administración de Puro Deporte.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">Torneos Activos</CardTitle>
            <FaTrophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">4</div>
            <p className="text-xs text-muted-foreground mt-1">+1 respecto al mes pasado</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">Jugadores Registrados</CardTitle>
            <FaUsers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">256</div>
            <p className="text-xs text-muted-foreground mt-1">+12 esta semana</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">Partidos Finalizados</CardTitle>
            <FaChartLine className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">42</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">Resultados Pendientes</CardTitle>
            <FaExclamationTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">3</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
