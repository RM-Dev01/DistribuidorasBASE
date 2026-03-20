import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Search, Clock, CheckCircle, Truck, XCircle, ShoppingBag } from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock; step: number }> = {
  pending:    { label: "Pendiente",   color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock, step: 1 },
  confirmed:  { label: "Confirmado",  color: "bg-blue-100 text-blue-700 border-blue-200",       icon: CheckCircle, step: 2 },
  in_transit: { label: "En camino",   color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck, step: 3 },
  delivered:  { label: "Entregado",   color: "bg-green-100 text-green-700 border-green-200",    icon: CheckCircle, step: 4 },
  cancelled:  { label: "Cancelado",   color: "bg-red-100 text-red-700 border-red-200",          icon: XCircle, step: 0 },
};

function OrderDetail({ orderNumber }: { orderNumber: string }) {
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order-tracking", orderNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items(*, products(name, sale_price)), customers(name, phone)`)
        .eq("order_number", orderNumber)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
        <p className="text-gray-500 mt-4">Buscando pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="font-semibold text-gray-700">No encontramos ese pedido</p>
        <p className="text-gray-400 text-sm mt-1">Verificá el número e intentá de nuevo</p>
      </div>
    );
  }

  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = status.icon;
  const steps = ["Pedido recibido", "Confirmado", "En camino", "Entregado"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Número de pedido</p>
            <h2 className="text-2xl font-mono font-bold text-blue-600">{order.order_number}</h2>
            <p className="text-sm text-gray-500 mt-1">Realizado el {formatDate(order.created_at)}</p>
          </div>
          <Badge className={`${status.color} border px-4 py-2 text-sm font-semibold flex items-center gap-2 self-start`}>
            <StatusIcon className="w-4 h-4" /> {status.label}
          </Badge>
        </div>

        {/* Progress bar */}
        {order.status !== "cancelled" && (
          <div className="mt-6">
            <div className="flex items-center">
              {steps.map((step, idx) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex flex-col items-center ${idx < steps.length - 1 ? "flex-1" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${status.step > idx ? "bg-blue-600 text-white" : status.step === idx + 1 ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-gray-100 text-gray-400"}`}>
                      {status.step > idx ? "✓" : idx + 1}
                    </div>
                    <span className={`text-xs mt-1.5 text-center hidden sm:block ${status.step > idx ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                      {step}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${status.step > idx + 1 ? "bg-blue-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-gray-500" /> Productos
        </h3>
        <div className="space-y-3">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Package className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.products?.name || "Producto"}</p>
                  <p className="text-xs text-gray-400">x{item.quantity} — {formatPrice(item.unit_price)} c/u</p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between font-bold text-gray-900 text-lg">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Customer info */}
      {order.customers && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Datos de entrega</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="text-gray-400">Nombre:</span> {order.customers.name}</p>
            {order.customers.phone && <p><span className="text-gray-400">Teléfono:</span> {order.customers.phone}</p>}
            {order.scheduled_date && <p><span className="text-gray-400">Fecha estimada:</span> {formatDate(order.scheduled_date)}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoreOrderTracking() {
  const [, params] = useRoute("/tienda/pedido/:number");
  const [searchInput, setSearchInput] = useState(params?.number || "");
  const [activeSearch, setActiveSearch] = useState(params?.number || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim().toUpperCase());
  };

  return (
    <StoreLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Truck className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Seguir mi pedido</h1>
          <p className="text-gray-500 mt-1">Ingresá tu número de pedido para ver el estado</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ej: WEB-K3F9ZA2..."
              className="pl-10 rounded-xl h-12 font-mono"
            />
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl h-12 px-6">
            Buscar
          </Button>
        </form>

        {activeSearch && <OrderDetail orderNumber={activeSearch} />}
      </div>
    </StoreLayout>
  );
}
