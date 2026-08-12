import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaTrophy, FaUsers, FaChartLine, FaExclamationTriangle, FaEye, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaRoute } from "react-icons/fa";
import { getEstadisticasVisitas } from "@/app/actions/visitas";
import { VisitasCharts } from "@/components/VisitasCharts";

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

  // Estadísticas de visitas: solo para admin
  const estadisticasVisitas =
    user.role === "admin" ? await getEstadisticasVisitas() : null;

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

      {/* Estadísticas de visitas — solo visible para admin */}
      {estadisticasVisitas && (
        <section aria-labelledby="visitas-heading" className="space-y-6">
          <h2 id="visitas-heading" className="text-xl font-bold tracking-tight">
            Estadísticas de Visitas
          </h2>

          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground">Total Histórico</CardTitle>
                <FaEye className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{estadisticasVisitas.totalVisitas.toLocaleString("es-CO")}</div>
                <p className="text-xs text-muted-foreground mt-1">Visitas acumuladas</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground">Hoy</CardTitle>
                <FaCalendarDay className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{estadisticasVisitas.visitasHoy.toLocaleString("es-CO")}</div>
                <p className="text-xs text-muted-foreground mt-1">Visitas de hoy</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground">Últimos 7 días</CardTitle>
                <FaCalendarWeek className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{estadisticasVisitas.visitasUltimos7Dias.toLocaleString("es-CO")}</div>
                <p className="text-xs text-muted-foreground mt-1">Semana en curso</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground">Últimos 30 días</CardTitle>
                <FaCalendarAlt className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{estadisticasVisitas.visitasUltimos30Dias.toLocaleString("es-CO")}</div>
                <p className="text-xs text-muted-foreground mt-1">Mes en curso</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos visuales de Visitas */}
          <VisitasCharts estadisticas={estadisticasVisitas} />

          {/* Tabla de rutas más visitadas */}
          {estadisticasVisitas.rutasMasVisitadas.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FaRoute className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold text-muted-foreground">
                  Rutas más visitadas (top 10)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left px-6 py-3 font-semibold text-muted-foreground">#</th>
                        <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Ruta</th>
                        <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Visitas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estadisticasVisitas.rutasMasVisitadas.slice(0, 10).map((item, index) => (
                        <tr
                          key={item.ruta}
                          className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-3 text-muted-foreground font-mono">{index + 1}</td>
                          <td className="px-6 py-3 font-mono text-xs break-all">{item.ruta}</td>
                          <td className="px-6 py-3 text-right font-bold">{item.cantidad.toLocaleString("es-CO")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
