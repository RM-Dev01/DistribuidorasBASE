import { useState } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, ShoppingBag, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(price);
}

function generateOrderNumber() {
  return `WEB-${Date.now().toString(36).toUpperCase()}`;
}

export default function StoreCheckout() {
  const { items, totalPrice, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      // 1. Find or create customer
      let customerId: number | null = null;

      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", form.email)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: form.name,
            email: form.email || null,
            phone: form.phone || null,
            address: form.address || null,
          })
          .select("id")
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // 2. Create order
      const orderNum = generateOrderNumber();
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNum,
          customer_id: customerId,
          total: totalPrice,
          status: "pending",
          notes: form.notes || null,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      // 3. Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Success
      setOrderNumber(orderNum);
      clearCart();

    } catch (err: any) {
      toast.error("Error al procesar el pedido: " + (err.message || "Intentá de nuevo"));
    } finally {
      setLoading(false);
    }
  };

  // Order confirmed
  if (orderNumber) {
    return (
      <StoreLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido recibido!</h1>
          <p className="text-gray-500 mb-6">
            Tu pedido fue registrado exitosamente. Te contactaremos para coordinar la entrega.
          </p>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-8">
            <p className="text-sm text-gray-500 mb-1">Número de pedido</p>
            <p className="text-2xl font-mono font-bold text-blue-600">{orderNumber}</p>
            <p className="text-xs text-gray-400 mt-2">Guardá este número para hacer seguimiento</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/tienda/pedido/${orderNumber}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2">
                <ShoppingBag className="w-4 h-4" /> Ver mi pedido
              </Button>
            </Link>
            <Link href="/tienda">
              <Button variant="outline" className="rounded-xl">Seguir comprando</Button>
            </Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <p className="text-gray-500 mb-4">No tenés productos en el carrito</p>
          <Link href="/tienda"><Button>Ir al catálogo</Button></Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/tienda/carrito">
            <Button variant="ghost" size="sm" className="gap-1 text-gray-500 hover:text-gray-700 pl-0">
              <ArrowLeft className="w-4 h-4" /> Volver al carrito
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Finalizar pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Tus datos de contacto</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Juan García"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="juan@email.com"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="351 123 4567"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">Dirección de entrega</Label>
                    <Input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Av. Siempre Viva 742, Córdoba"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notas adicionales</Label>
                    <Input
                      id="notes"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Horario de entrega, instrucciones especiales..."
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-base font-semibold gap-2"
                    disabled={loading || !form.name}
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                    ) : (
                      <><ShoppingBag className="w-4 h-4" /> Confirmar pedido — {formatPrice(totalPrice)}</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Tu pedido</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                      {item.name} <span className="text-gray-400">x{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
