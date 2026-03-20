import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(price);
}

export default function StoreCatalog() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { addItem, items } = useCart();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["store-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name), brands(id, name)")
        .eq("web_enabled", true)
        .eq("is_active", true)
        .gt("stock", 0)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["store-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["store-brands"],
    queryFn: async () => {
      const { data } = await supabase.from("brands").select("*").order("name");
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    return products.filter((p: any) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !selectedCategory || p.category_id === selectedCategory;
      const matchBrand = !selectedBrand || p.brand_id === selectedBrand;
      return matchSearch && matchCat && matchBrand;
    });
  }, [products, search, selectedCategory, selectedBrand]);

  const isInCart = (id: number) => items.some(i => i.id === id);

  const handleAdd = (p: any) => {
    addItem({ id: p.id, name: p.name, price: p.sale_price, stock: p.stock });
    toast.success(`${p.name} agregado al carrito`);
  };

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedBrand ? 1 : 0);

  return (
    <StoreLayout onSearch={setSearch} searchValue={search}>
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Catálogo de productos</h1>
          <p className="text-blue-100 text-lg">Encontrá lo que necesitás al mejor precio</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters - desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categorías</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      Todas
                    </button>
                  </li>
                  {categories.map((cat: any) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedCategory === cat.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        {cat.name}
                        {selectedCategory === cat.id && <X className="w-3 h-3" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {brands.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Marcas</h3>
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => setSelectedBrand(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedBrand ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        Todas
                      </button>
                    </li>
                    {brands.map((brand: any) => (
                      <li key={brand.id}>
                        <button
                          onClick={() => setSelectedBrand(selectedBrand === brand.id ? null : brand.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedBrand === brand.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {brand.name}
                          {selectedBrand === brand.id && <X className="w-3 h-3" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter bar */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <p className="text-sm text-gray-500">{filtered.length} productos</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="bg-blue-600 text-white h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile filters */}
            {showFilters && (
              <div className="lg:hidden mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Categoría</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedCategory(null)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!selectedCategory ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>Todas</button>
                    {categories.map((cat: any) => (
                      <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedCategory === cat.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>{cat.name}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
                {search && ` para "${search}"`}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedBrand(null); }}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Limpiar filtros
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-500">Sin productos</p>
                <p className="text-gray-400 mt-1 mb-6">No encontramos productos con esos filtros</p>
                <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory(null); setSelectedBrand(null); }}>
                  Ver todos los productos
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((product: any) => (
                  <div key={product.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 flex flex-col">
                    {/* Product image placeholder */}
                    <Link href={`/tienda/producto/${product.id}`} className="block">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                        <Package className="w-14 h-14 text-gray-300 group-hover:scale-105 transition-transform duration-200" />
                        {product.categories?.name && (
                          <span className="absolute top-2 left-2 bg-white/90 text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">
                            {product.categories.name}
                          </span>
                        )}
                        {product.stock <= product.min_stock && (
                          <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Últimas unidades
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-3 flex flex-col flex-1">
                      <Link href={`/tienda/producto/${product.id}`}>
                        <h3 className="font-medium text-gray-900 text-sm leading-snug mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      {product.brands?.name && (
                        <p className="text-xs text-gray-400 mb-2">{product.brands.name}</p>
                      )}
                      <div className="mt-auto">
                        <p className="text-lg font-bold text-gray-900 mb-2">
                          {formatPrice(product.sale_price)}
                        </p>
                        <Button
                          size="sm"
                          className={`w-full text-xs h-9 rounded-xl transition-all ${isInCart(product.id) ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                          onClick={() => handleAdd(product)}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                          {isInCart(product.id) ? "Agregar más" : "Agregar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
