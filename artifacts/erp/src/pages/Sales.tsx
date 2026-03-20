import { useSales } from "@/hooks/use-erp";
import { Card } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Receipt, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sales() {
  const { data: sales, isLoading } = useSales();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-500';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      case 'refunded': return 'bg-orange-500/20 text-orange-500';
      default: return 'bg-secondary text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Historial de Ventas</h1>
        <p className="text-muted-foreground mt-1">Registro de todas las transacciones POS y Web</p>
      </div>

      <Card className="rounded-2xl border-border/50 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : sales?.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
            <Receipt className="w-16 h-16 mb-4 opacity-20" />
            <p>No hay ventas registradas.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead>Nº Venta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales?.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-secondary/20">
                  <TableCell className="font-mono font-medium">{sale.sale_number}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(sale.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{(sale as any).customers?.name || 'Consumidor Final'}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    ${sale.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
