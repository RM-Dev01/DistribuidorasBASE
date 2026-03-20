import { Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight } from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(price);
}

export default function StoreCart() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingCart className="w-6 h-6" />
          Mi carrito
          {totalItems > 0 && (
            <span className="text-base font-normal text-gray-500">({totalItems} {totalItems === 1 ? "producto" : "productos"})</span>
          )}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-500 mb-2">Tu carrito está vacío</p>
            <p className="text-gray-400 mb-8">Agregá productos desde el catálogo</p>
            <Link href="/tienda">
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2">
                <Package className="w-4 h-4" /> Ir al catálogo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 hover:border-gray-300 transition-colors">
                  {/* Image placeholder */}
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center shrink-0">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link href={`/tienda/producto/${item.id}`}>
                        <h3 className="font-semibold text-gray-900 leading-snug hover:text-blue-600 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors shrink-0 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-400 mb-3">{formatPrice(item.price)} c/u</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}

              <Link href="/tienda" className="block">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2 pl-0">
                  ← Seguir comprando
                </Button>
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Resumen del pedido</h2>

                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span className="line-clamp-1 flex-1 mr-2">{item.name} x{item.quantity}</span>
                      <span className="shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-gray-900 text-lg">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Precios en pesos argentinos</p>
                </div>

                <Link href="/tienda/checkout">
                  <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-base font-semibold gap-2">
                    Finalizar pedido <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <p className="text-xs text-center text-gray-400 mt-3">
                  Sin cargo por realizar el pedido
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
