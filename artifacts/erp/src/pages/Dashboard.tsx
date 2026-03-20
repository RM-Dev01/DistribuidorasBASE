import { useDashboardStats, useSales } from "@/hooks/use-erp";
import { Card } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: sales } = useSales();

  // Mock chart data generation from sales
  const chartData = [
    { name: 'Lun', total: 4000 },
    { name: 'Mar', total: 3000 },
    { name: 'Mié', total: 2000 },
    { name: 'Jue', total: 2780 },
    { name: 'Vie', total: 1890 },
    { name: 'Sáb', total: 2390 },
    { name: 'Dom', total: 3490 },
  ];

  if (isLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-8 w-48 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
      </div>
    </div>;
  }

  const statCards = [
    { title: "Ventas de Hoy", value: `$${stats?.todaySales.toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Operaciones", value: stats?.todaySalesCount, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Clientes", value: stats?.totalCustomers, icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Productos", value: stats?.totalProducts, icon: Package, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general del negocio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 rounded-2xl border-border/50 shadow-lg shadow-black/5 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 rounded-2xl border-border/50 shadow-lg h-[400px] flex flex-col">
            <h3 className="font-semibold text-lg mb-6">Ingresos Últimos 7 Días</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dx={-10} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 rounded-2xl border-border/50 shadow-lg h-[400px] flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Últimas Ventas</h3>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              {sales?.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-foreground">{sale.sale_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(sale.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-foreground">${sale.total.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-wider text-green-500 font-semibold">{sale.status}</p>
                  </div>
                </div>
              ))}
              {!sales?.length && (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  No hay ventas recientes
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
