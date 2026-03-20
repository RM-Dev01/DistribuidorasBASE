import { Card } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function GenericModule({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <Card className="flex-1 rounded-2xl border-border/50 shadow-lg flex flex-col items-center justify-center p-12 text-center bg-secondary/10">
        <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-6 shadow-inner border border-border/50">
          <Wrench className="w-12 h-12 text-primary opacity-80" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Módulo en Construcción</h2>
        <p className="text-muted-foreground max-w-md">
          Esta vista está estructurada y conectada a la base de datos Supabase. 
          Los componentes específicos de UI para "{title}" están listos para ser implementados con el mismo lenguaje de diseño.
        </p>
      </Card>
    </div>
  );
}
