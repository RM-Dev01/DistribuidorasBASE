import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Search, Menu, X, Store, User, Package } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface StoreLayoutProps {
  children: ReactNode;
  onSearch?: (term: string) => void;
  searchValue?: string;
}

export function StoreLayout({ children, onSearch, searchValue = "" }: StoreLayoutProps) {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/tienda" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-sm">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Mi Tienda</span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchValue}
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 rounded-xl h-10 text-sm focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/tienda/cuenta">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-gray-600 hover:text-gray-900">
                  <User className="w-4 h-4" />
                  <span>Mi cuenta</span>
                </Button>
              </Link>

              <Link href="/tienda/carrito">
                <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-900">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              <Button variant="ghost" size="sm" className="sm:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-2">
            <Link href="/tienda/cuenta" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2 text-gray-700">
                <User className="w-4 h-4" /> Mi cuenta
              </Button>
            </Link>
            <Link href="/tienda/pedidos" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2 text-gray-700">
                <Package className="w-4 h-4" /> Mis pedidos
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">Mi Tienda</span>
              </div>
              <p className="text-sm">Tu tienda online de confianza</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Navegación</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/tienda" className="hover:text-white transition-colors">Catálogo</Link></li>
                <li><Link href="/tienda/carrito" className="hover:text-white transition-colors">Carrito</Link></li>
                <li><Link href="/tienda/cuenta" className="hover:text-white transition-colors">Mi cuenta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Ayuda</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/tienda/pedidos" className="hover:text-white transition-colors">Seguir pedido</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            © {new Date().getFullYear()} Mi Tienda. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
