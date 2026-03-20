# Sistema ERP

## Arquitectura

**Frontend-only** conectado directamente a Supabase. No hay backend Express para datos — Supabase actúa como backend completo (Auth + DB + RLS).

## Stack

- **Frontend**: React + Vite + TypeScript
- **Base de datos**: Supabase (PostgreSQL con RLS)
- **Autenticación**: Supabase Auth
- **Routing**: Wouter
- **Estilos**: Tailwind CSS v4 + Shadcn UI
- **Estado servidor**: TanStack React Query
- **Gráficos**: Recharts
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

## Variables de Entorno

- `VITE_SUPABASE_URL`: URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave pública anon de Supabase

## Estructura

```
artifacts/erp/
├── src/
│   ├── lib/supabase.ts          # Cliente Supabase + tipos AppUser
│   ├── hooks/use-auth.tsx       # AuthContext con Supabase Auth
│   ├── hooks/use-erp.ts         # Hooks de React Query para datos ERP
│   ├── components/layout/       # DashboardLayout con Sidebar por rol
│   ├── pages/                   # Páginas por módulo
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── POS.tsx
│   │   ├── Products.tsx
│   │   ├── Customers.tsx
│   │   ├── Sales.tsx
│   │   └── GenericModule.tsx
│   └── types/database.ts        # Tipos TypeScript para tablas Supabase
├── supabase-schema.sql           # Schema SQL completo para ejecutar en Supabase
└── public/images/               # Imágenes generadas (login-bg, logo)
```

## Módulos ERP

1. **Dashboard** — KPIs por rol (admin/vendedor/chofer/cajero)
2. **POS** — Punto de Venta con carrito
3. **Productos** — Catálogo con CRUD
4. **Inventario** — Stock y reposición
5. **Clientes** — Cuenta corriente
6. **Ventas** — Historial y estados
7. **Caja Diaria** — Apertura/cierre/arqueo
8. **Envíos** — Módulo para choferes
9. **Ajustes** — Métodos de pago, categorías, marcas

## Roles

- `admin` — Acceso total
- `seller` — POS, productos, clientes, ventas, pedidos
- `driver` — Dashboard y envíos propios
- `cashier` — POS, caja, ventas
- `warehouse` — Productos, inventario, compras

## Setup Inicial Supabase

1. Ejecutar `artifacts/erp/supabase-schema.sql` en Supabase SQL Editor
2. Crear primer usuario en Authentication → Users
3. Asignar rol admin: `UPDATE profiles SET role = 'admin' WHERE id = '<user-id>';`

## Monorepo

- **Monorepo tool**: pnpm workspaces
- **Node.js**: 24
- El `artifacts/api-server` existe pero no es usado por el ERP (Supabase reemplaza el backend)
