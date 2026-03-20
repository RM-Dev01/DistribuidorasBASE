import { useState } from "react";
import { useProducts, useCustomers, useCreateSale } from "@/hooks/use-erp";
import { Product, Customer } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CartItem extends Product {
  cartQuantity: number;
}

export default function POS() {
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();
  const createSale = useCreateSale();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("1"); // Default cash
  const [discount, setDiscount] = useState(0);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stock) {
          toast.error("Stock insuficiente");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      if (product.stock <= 0) {
        toast.error("Producto sin stock");
        return prev;
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.cartQuantity + delta;
        if (newQ > item.stock) {
          toast.error("Stock insuficiente");
          return item;
        }
        return newQ > 0 ? { ...item, cartQuantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.sale_price * item.cartQuantity), 0);
  const total = subtotal - discount;

  const handleCheckout = () => {
    if (cart.length === 0) return toast.error("El carrito está vacío");
    
    createSale.mutate({
      sale: {
        sale_number: `POS-${Date.now()}`,
        customer_id: selectedCustomer ? parseInt(selectedCustomer) : null,
        subtotal,
        discount,
        total,
        payment_method_id: parseInt(paymentMethod),
        status: 'completed',
      },
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.cartQuantity,
        unit_price: item.sale_price,
        discount: 0,
        subtotal: item.sale_price * item.cartQuantity
      }))
    }, {
      onSuccess: () => {
        toast.success("Venta completada con éxito");
        setCart([]);
        setSelectedCustomer("");
        setDiscount(0);
      }
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Left Pane - Products */}
      <div className="flex-1 flex flex-col min-w-0 bg-card border border-border/50 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-border/50 bg-secondary/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar producto por nombre o SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-background"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts?.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="group p-4 rounded-xl border border-border/50 bg-background hover:border-primary/50 hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="aspect-square bg-secondary/30 rounded-lg mb-3 flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="font-medium text-sm leading-tight line-clamp-2 mb-1">{product.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary">${product.sale_price.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane - Cart */}
      <div className="w-96 flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-border/50 bg-secondary/20 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Carrito de Venta</h2>
        </div>

        <div className="p-4 border-b border-border/50 space-y-3">
           <div className="flex items-center gap-2 text-sm">
             <User className="w-4 h-4 text-muted-foreground" />
             <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Consumidor Final" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Consumidor Final</SelectItem>
                  {customers?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
           </div>
           <div className="flex items-center gap-2 text-sm">
             <CreditCard className="w-4 h-4 text-muted-foreground" />
             <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Efectivo</SelectItem>
                  <SelectItem value="2">Transferencia</SelectItem>
                  <SelectItem value="3">Tarjeta Débito</SelectItem>
                  <SelectItem value="4">Tarjeta Crédito</SelectItem>
                </SelectContent>
             </Select>
           </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="flex gap-3 bg-secondary/20 p-3 rounded-xl border border-border/50">
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-sm truncate">{item.name}</h5>
                <p className="text-primary font-semibold text-sm">${item.sale_price.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end justify-between gap-2">
                <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:opacity-80">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 bg-background rounded-lg border border-border px-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary"><Minus className="w-3 h-3" /></button>
                  <span className="text-sm font-medium w-4 text-center">{item.cartQuantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <ShoppingCart className="w-12 h-12 mb-2" />
              <p>Agrega productos</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-secondary/30 border-t border-border/50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground items-center">
              <span>Descuento</span>
              <Input 
                type="number" 
                value={discount} 
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-24 h-7 text-right"
              />
            </div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-xl">
              <span>Total</span>
              <span className="text-primary">${total.toLocaleString()}</span>
            </div>
          </div>
          <Button 
            className="w-full h-12 text-lg rounded-xl" 
            onClick={handleCheckout}
            disabled={cart.length === 0 || createSale.isPending}
          >
            {createSale.isPending ? "Procesando..." : "Cobrar e Imprimir"}
          </Button>
        </div>
      </div>
    </div>
  );
}
