import { useState } from "react";
import { useCustomers, useCreateCustomer } from "@/hooks/use-erp";
import { Customer } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Users, ExternalLink } from "lucide-react";

export default function Customers() {
  const { data: customers, isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: "", email: "", phone: "", address: "", dni: "", current_account_balance: 0, is_active: true
  });

  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.dni && c.dni.includes(searchTerm))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({name: "", email: "", phone: "", address: "", dni: "", current_account_balance: 0, is_active: true});
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">Directorio y cuentas corrientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">Registrar Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre Completo / Razón Social</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>DNI / CUIT</Label>
                  <Input value={formData.dni || ""} onChange={e => setFormData({...formData, dni: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={createCustomer.isPending}>
                  {createCustomer.isPending ? "Guardando..." : "Guardar Cliente"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/50 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-border/50 bg-secondary/20 flex gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre o DNI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background rounded-xl"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : filteredCustomers?.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
            <Users className="w-16 h-16 mb-4 opacity-20" />
            <p>No se encontraron clientes.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI/CUIT</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Cuenta Corriente</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers?.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-secondary/20">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.dni || '-'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{customer.phone}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className={customer.current_account_balance > 0 ? "text-destructive" : "text-green-500"}>
                      ${customer.current_account_balance.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Cuenta
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
