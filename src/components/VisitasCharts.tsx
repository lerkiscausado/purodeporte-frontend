"use client";

import { EstadisticasVisitas } from "@/app/actions/visitas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaChartBar, FaMobileAlt } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

interface VisitasChartsProps {
  estadisticas: EstadisticasVisitas;
}

const BAR_COLORS = ["#3b82f6", "#10b981", "#f97316"]; // Azul (Hoy), Verde (7 días), Naranja (30 días)
const PIE_COLORS = ["#8b5cf6", "#06b6d4"]; // Morado (Móvil), Cyan (Escritorio)

export function VisitasCharts({ estadisticas }: VisitasChartsProps) {
  // Datos para el gráfico de barras
  const barData = [
    { periodo: "Hoy", visitas: estadisticas.visitasHoy },
    { periodo: "Últimos 7 días", visitas: estadisticas.visitasUltimos7Dias },
    { periodo: "Últimos 30 días", visitas: estadisticas.visitasUltimos30Dias },
  ];

  // Datos para el gráfico de dona/torta de dispositivos
  const movil = estadisticas.dispositivos?.movil ?? 0;
  const escritorio = estadisticas.dispositivos?.escritorio ?? 0;
  const totalDispositivos = movil + escritorio;

  const pieData = [
    { name: "Móvil", value: movil },
    { name: "Escritorio", value: escritorio },
  ];

  const hasDeviceData = totalDispositivos > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico 1: Barras - Comparativa de Visitas */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <FaChartBar className="h-4 w-4 text-primary" />
            Comparativa de Visitas por Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis
                  dataKey="periodo"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => Number(val).toLocaleString("es-CO")}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "var(--card, #1e293b)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "var(--foreground, #ffffff)",
                  }}
                  formatter={(val: any) => [Number(val).toLocaleString("es-CO") + " visitas", "Visitas"]}
                />
                <Bar dataKey="visitas" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 2: Dona/Torta - Distribución por Dispositivo */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <FaMobileAlt className="h-4 w-4 text-purple-500" />
            Dispositivos (Últimos 30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasDeviceData ? (
            <div className="h-[240px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      percent ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card, #1e293b)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--foreground, #ffffff)",
                    }}
                    formatter={(val: any) => [
                      `${Number(val).toLocaleString("es-CO")} (${((Number(val) / totalDispositivos) * 100).toFixed(1)}%)`,
                      "Visitas",
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] w-full flex items-center justify-center text-muted-foreground text-xs font-medium italic">
              Aún no hay datos de dispositivos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
