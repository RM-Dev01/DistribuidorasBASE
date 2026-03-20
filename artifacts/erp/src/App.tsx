import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import POS from "@/pages/POS";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Sales from "@/pages/Sales";
import GenericModule from "@/pages/GenericModule";
import NotFound from "@/pages/not-found";

// Public store pages
import StoreCatalog from "@/pages/store/StoreCatalog";
import StoreProduct from "@/pages/store/StoreProduct";
import StoreCart from "@/pages/store/StoreCart";
import StoreCheckout from "@/pages/store/StoreCheckout";
import StoreOrderTracking from "@/pages/store/StoreOrderTracking";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  // Allow public store routes without auth
  if (location.startsWith("/tienda")) {
    return (
      <Switch>
        <Route path="/tienda" component={StoreCatalog} />
        <Route path="/tienda/producto/:id" component={StoreProduct} />
        <Route path="/tienda/carrito" component={StoreCart} />
        <Route path="/tienda/checkout" component={StoreCheckout} />
        <Route path="/tienda/pedido/:number" component={StoreOrderTracking} />
        <Route path="/tienda/pedidos" component={StoreOrderTracking} />
        <Route component={StoreCatalog} />
      </Switch>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (location !== "/login") {
      return <Redirect to="/login" />;
    }
    return (
      <Switch>
        <Route path="/login" component={Login} />
      </Switch>
    );
  }

  if (location === "/login") {
    return <Redirect to="/" />;
  }

  const canAccess = (roles: string[]) => roles.includes(user.role);

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/pos">
          {canAccess(["admin", "seller", "cashier"]) ? <POS /> : <AccessDenied />}
        </Route>
        <Route path="/productos">
          {canAccess(["admin", "seller", "warehouse"]) ? <Products /> : <AccessDenied />}
        </Route>
        <Route path="/clientes">
          {canAccess(["admin", "seller"]) ? <Customers /> : <AccessDenied />}
        </Route>
        <Route path="/ventas">
          {canAccess(["admin", "seller", "cashier"]) ? <Sales /> : <AccessDenied />}
        </Route>
        <Route path="/inventario">
          {canAccess(["admin", "warehouse"]) ? (
            <GenericModule title="Inventario" description="Gestión de stock y reposición" />
          ) : <AccessDenied />}
        </Route>
        <Route path="/caja">
          {canAccess(["admin", "cashier"]) ? (
            <GenericModule title="Caja Diaria" description="Apertura, cierre y arqueo" />
          ) : <AccessDenied />}
        </Route>
        <Route path="/envios">
          {canAccess(["admin", "driver"]) ? (
            <GenericModule title="Módulo de Envíos" description="Gestión logística para choferes" />
          ) : <AccessDenied />}
        </Route>
        <Route path="/ajustes">
          {canAccess(["admin"]) ? (
            <GenericModule title="Ajustes del Sistema" description="Configuración global del ERP" />
          ) : <AccessDenied />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-2">Acceso Denegado</h2>
      <p className="text-muted-foreground">No tenés permisos para ver esta sección.</p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Switch>
                <Route path="/login" component={Login} />
                <Route>
                  <AppContent />
                </Route>
              </Switch>
            </WouterRouter>
            <Toaster />
            <SonnerToaster position="top-right" richColors />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
