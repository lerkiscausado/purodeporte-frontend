"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaCalendarAlt } from "react-icons/fa";

export default function ProgramarPartidoPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("¡Partido programado exitosamente! (Simulación)");
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Programación de Partidos</h1>
        <p className="text-muted-foreground">Establece la fecha, hora y lugar de los enfrentamientos.</p>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle>Detalles del Encuentro</CardTitle>
          <CardDescription>Esta información será visible públicamente en el calendario general.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECCIÓN: TORNEO Y ESCENARIO */}
            <div className="bg-secondary/10 p-5 rounded-xl border border-border/50 space-y-4 shadow-sm">
              <h3 className="font-bold text-lg border-b border-border/40 pb-2 mb-4 text-primary">Contexto del Partido</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Torneo</Label>
                  <Select required name="torneo">
                    <SelectTrigger className="bg-card h-10 border-border/60">
                      <SelectValue placeholder="Selecciona un torneo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t1">Liga de Baloncesto Nocturna</SelectItem>
                      <SelectItem value="t2">Copa Relámpago Fútbol 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Escenario Deportivo</Label>
                  <Select required name="escenario">
                    <SelectTrigger className="bg-card h-10 border-border/60">
                      <SelectValue placeholder="Selecciona una cancha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="e1">Cancha Múltiple La Bombonera</SelectItem>
                      <SelectItem value="e2">Coliseo Cubierto Centro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECCIÓN: EQUIPOS */}
            <div className="bg-secondary/10 p-5 rounded-xl border border-border/50 space-y-4 shadow-sm">
              <h3 className="font-bold text-lg border-b border-border/40 pb-2 mb-4 text-primary">Enfrentamiento</h3>
              
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="space-y-2 flex-1 w-full">
                  <Label className="font-bold">Equipo Local</Label>
                  <Select required name="local">
                    <SelectTrigger className="bg-card h-10 border-border/60">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eq1">Los Halcones</SelectItem>
                      <SelectItem value="eq2">Pumas del Norte</SelectItem>
                      <SelectItem value="eq3">Leones FC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-2xl font-black text-muted-foreground pt-6 hidden md:block">VS</div>

                <div className="space-y-2 flex-1 w-full">
                  <Label className="font-bold">Equipo Visitante</Label>
                  <Select required name="visitante">
                    <SelectTrigger className="bg-card h-10 border-border/60">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eq1">Los Halcones</SelectItem>
                      <SelectItem value="eq2">Pumas del Norte</SelectItem>
                      <SelectItem value="eq3">Leones FC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECCIÓN: FECHA Y HORA */}
            <div className="bg-secondary/10 p-5 rounded-xl border border-border/50 space-y-4 shadow-sm">
              <h3 className="font-bold text-lg border-b border-border/40 pb-2 mb-4 text-primary">Fecha y Hora</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha" className="font-bold">Fecha del Partido</Label>
                  <Input id="fecha" name="fecha" type="date" required className="bg-card h-10 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora" className="font-bold">Hora</Label>
                  <Input id="hora" name="hora" type="time" required className="bg-card h-10 border-border/60" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full font-bold h-12">
              <FaCalendarAlt className="mr-2" /> Guardar Programación
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
