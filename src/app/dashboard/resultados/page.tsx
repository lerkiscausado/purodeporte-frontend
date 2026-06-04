"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaSave, FaCheckCircle } from "react-icons/fa";

export default function CargarResultadosPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("¡Resultado cargado exitosamente! (Simulación)");
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Cargar Resultados</h1>
        <p className="text-muted-foreground">Actualiza el marcador de los partidos finalizados.</p>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle>Reporte de Partido</CardTitle>
          <CardDescription>Los cambios se reflejarán de inmediato en la tabla general.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label className="font-bold">Partido a reportar</Label>
              <Select required>
                <SelectTrigger className="bg-background h-12">
                  <SelectValue placeholder="Busca un partido pendiente..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p1">Los Halcones vs Pumas del Norte (Hoy 20:00)</SelectItem>
                  <SelectItem value="p2">Leones FC vs Tigres Vóley (Mañana 18:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Marcador Block */}
            <div className="bg-secondary/20 p-6 rounded-lg border border-border/50">
              <h3 className="text-center font-bold mb-6 text-lg">Marcador Final</h3>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="golesLocal" className="font-bold text-center block">Equipo Local</Label>
                  <Input id="golesLocal" type="number" min="0" required className="bg-background text-center text-3xl h-16 font-black" />
                </div>
                
                <div className="text-2xl font-black text-muted-foreground pt-6">VS</div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="golesVisita" className="font-bold text-center block">Equipo Visitante</Label>
                  <Input id="golesVisita" type="number" min="0" required className="bg-background text-center text-3xl h-16 font-black" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full font-bold h-12">
              <FaCheckCircle className="mr-2 h-5 w-5" /> Confirmar Resultado Oficial
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
