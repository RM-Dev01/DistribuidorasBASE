import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, ChevronLeft, Plus, Minus, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(price);
}

export default function StoreProduct() {
  const [, params] = useRoute("/tienda/producto/:id");
  const productId = params?.id ? parseInt(params.id) : null;
  const [qty, setQty] = useState(1);
  const { addItem, items, updateQuantity } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["store-product", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name), brands(name)")
        .eq("id", productId!)
        .eq("web_enabled", true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const cartItem = items.find(i => i.id === productId);

  const handleAdd = () => {
    if (!product) return;
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity + qty);
    } else {
      for (let i = 0; i < qty; i++) {
        addItem({ id: product.id, name: product.name, price: product.sale_price, stock: product.stock });
      }
    }
    toast.success(`${qty > 1 ? `${qty}x ` : ""}${product.name} agregado al carrito`);
    setQty(1);
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded-lg animate-pulse w-3/4" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
              <div className="h-10 bg-gray-100 rounded-xl animate-pulse w-1/3 mt-4" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Producto no encontrado</h2>
          <Link href="/tienda">
            <Button>Volver al catálogo</Button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <StoreLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/tienda" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Catálogo
          </Link>
          {product.categories?.name && (
            <>
              <span>/</span>
              <span>{product.categories.name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center border border-gray-100">
            <Package className="w-28 h-28 text-gray-300" />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {/* Category & Brand */}
            <div className="flex gap-2 mb-3">
              {product.categories?.name && (
                <Badge variant="secondary" className="text-xs">{product.categories.name}</Badge>
              )}
              {product.brands?.name && (
                <Badge variant="outline" className="text-xs">{product.brands.name}</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>

            {product.sku && (
              <p className="text-sm text-gray-400 mb-4">SKU: {product.sku}</p>
            )}

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">{formatPrice(product.sale_price)}</p>
              {isOutOfStock ? (
                <p className="text-red-500 font-medium mt-1 text-sm">Sin stock disponible</p>
              ) : product.stock <= product.min_stock ? (
                <p className="text-orange-500 font-medium mt-1 text-sm">¡Últimas {product.stock} unidades!</p>
              ) : (
                <p className="text-green-600 font-medium mt-1 text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" /> En stock ({product.stock} disponibles)
                </p>
              )}
            </div>

            {/* Cart feedback */}
            {cartItem && (
              <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Ya tenés {cartItem.quantity} en el carrito
              </div>
            )}

            {/* Quantity picker */}
            {!isOutOfStock && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Cantidad</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-900">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">Subtotal: {formatPrice(product.sale_price * qty)}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700 rounded-xl gap-2"
                disabled={isOutOfStock}
                onClick={handleAdd}
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
              </Button>
              <Link href="/tienda/carrito" className="flex-1">
                <Button variant="outline" className="w-full h-12 text-base rounded-xl">
                  Ver carrito
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
