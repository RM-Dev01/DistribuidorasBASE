import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  Truck, DollarSign, Settings, LogOut, Receipt, ShieldAlert,
  ClipboardList, Globe
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "seller", "driver", "cashier"] },
  { title: "Punto de Venta", href: "/pos", icon: ShoppingCart, roles: ["admin", "seller", "cashier"] },
  { title: "Productos", href: "/productos", icon: Package, roles: ["admin", "seller", "warehouse"] },
  { title: "Inventario", href: "/inventario", icon: ClipboardList, roles: ["admin", "warehouse"] },
  { title: "Clientes", href: "/clientes", icon: Users, roles: ["admin", "seller"] },
  { title: "Ventas", href: "/ventas", icon: Receipt, roles: ["admin", "seller", "cashier"] },
  { title: "Caja Diaria", href: "/caja", icon: DollarSign, roles: ["admin", "cashier"] },
  { title: "Envíos", href: "/envios", icon: Truck, roles: ["admin", "driver"] },
  { title: "Ajustes", href: "/ajustes", icon: Settings, roles: ["admin"] },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  if (!user) return null;

  const allowedNavItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border/50 bg-card">
          <SidebarHeader className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">ERP Core</span>
          </SidebarHeader>
          <SidebarContent className="px-3 py-4">
            <SidebarMenu>
              {allowedNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    className="h-11 rounded-xl transition-all duration-200"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 opacity-70" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          {user.role === "admin" && (
            <div className="px-3 pb-2">
              <a href="/tienda" target="_blank" rel="noopener noreferrer">
                <SidebarMenuButton className="w-full h-11 rounded-xl text-primary/80 hover:text-primary hover:bg-primary/10 border border-dashed border-primary/30">
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Ver tienda web</span>
                </SidebarMenuButton>
              </a>
            </div>
          )}
          <SidebarFooter className="p-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 mb-4">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{user.role}</p>
            </div>
            <SidebarMenuButton 
              onClick={() => signOut()}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-11 rounded-xl"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center px-6 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <SidebarTrigger className="mr-4 lg:hidden" />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
               {/* Header actions can go here */}
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
