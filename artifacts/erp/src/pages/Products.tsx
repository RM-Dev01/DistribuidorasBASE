import { useState } from "react";
import { useProducts, useCreateProduct, useCategories } from "@/hooks/use-erp";
import { Product } from "@/types/database";
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
import { Plus, Search, Edit, Trash, PackageSearch } from "lucide-react";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "", sku: "", purchase_price: 0, sale_price: 0, stock: 0, min_stock: 0, web_enabled: false, is_active: true
  });

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({name: "", sku: "", purchase_price: 0, sale_price: 0, stock: 0, min_stock: 0, web_enabled: false, is_active: true});
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground mt-1">Gestión del catálogo e inventario</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">Agregar Producto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>Nombre del Producto</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>SKU / Código</Label>
                <Input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.category_id || ""}
                  onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})}
                >
                  <option value="">Seleccionar...</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Precio de Compra ($)</Label>
                <Input type="number" required value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Precio de Venta ($)</Label>
                <Input type="number" required value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Stock Actual</Label>
                <Input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Stock Mínimo</Label>
                <Input type="number" required value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: Number(e.target.value)})} />
              </div>
              <div className="col-span-2 flex justify-end mt-4">
                <Button type="submit" disabled={createProduct.isPending}>
                  {createProduct.isPending ? "Guardando..." : "Guardar Producto"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/50 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-border/50 bg-secondary/20 flex gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar productos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background rounded-xl"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : filteredProducts?.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
            <PackageSearch className="w-16 h-16 mb-4 opacity-20" />
            <p>No se encontraron productos.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">P. Venta</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product) => (
                <TableRow key={product.id} className="hover:bg-secondary/20">
                  <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{(product as any).categories?.name || '-'}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    ${product.sale_price.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold ${
                      product.stock <= product.min_stock ? 'bg-destructive/20 text-destructive' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {product.is_active ? 
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> : 
                      <span className="w-2 h-2 rounded-full bg-destructive inline-block"></span>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
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
