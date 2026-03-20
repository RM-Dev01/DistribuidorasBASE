-- ============================================================
-- ERP SYSTEM - Supabase Schema
-- Ejecutar este SQL en Supabase Dashboard > SQL Editor
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PERFILES DE USUARIO (extiende auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'seller', 'driver', 'cashier', 'warehouse')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CATEGORÍAS
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MARCAS
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MÉTODOS DE PAGO
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'transfer', 'qr', 'card', 'other')),
  direction TEXT NOT NULL CHECK (direction IN ('income', 'expense', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  dni TEXT,
  current_account_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROVEEDORES
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  current_debt NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PRODUCTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
  purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE,
  web_enabled BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- OFERTAS Y PROMOCIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12,2) NOT NULL,
  discount_code TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- COMPRAS A PROVEEDORES
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER REFERENCES suppliers(id),
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL,
  new_sale_price NUMERIC(12,2),
  subtotal NUMERIC(12,2) NOT NULL
);

-- ============================================================
-- CAJA DIARIA
-- ============================================================
CREATE TABLE IF NOT EXISTS cash_registers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  closing_balance NUMERIC(12,2),
  actual_balance NUMERIC(12,2),
  difference NUMERIC(12,2),
  difference_notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- ============================================================
-- VENTAS (POS)
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  sale_number TEXT NOT NULL UNIQUE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method_id INTEGER REFERENCES payment_methods(id),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'refunded')),
  cash_register_id INTEGER REFERENCES cash_registers(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL
);

-- ============================================================
-- PEDIDOS WEB
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
  driver_id UUID REFERENCES profiles(id),
  scheduled_date DATE,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

-- ============================================================
-- ENVÍOS
-- ============================================================
CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  driver_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRANSACCIONES FINANCIERAS
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_transactions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'salary', 'adjustment', 'initial_capital')),
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method_id INTEGER REFERENCES payment_methods(id),
  reference_id INTEGER,
  reference_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Función helper: obtener rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas: usuarios autenticados pueden leer
CREATE POLICY "Authenticated users can read profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles" ON profiles
  FOR ALL TO authenticated USING (get_user_role() = 'admin');

-- Lectura general para usuarios autenticados
CREATE POLICY "Authenticated read categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage categories" ON categories FOR ALL TO authenticated USING (get_user_role() = 'admin');

CREATE POLICY "Authenticated read brands" ON brands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage brands" ON brands FOR ALL TO authenticated USING (get_user_role() = 'admin');

CREATE POLICY "Authenticated read payment_methods" ON payment_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage payment_methods" ON payment_methods FOR ALL TO authenticated USING (get_user_role() = 'admin');

CREATE POLICY "Authenticated read customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage customers" ON customers FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'seller', 'cashier'));

CREATE POLICY "Authenticated read suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage suppliers" ON suppliers FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'warehouse'));

CREATE POLICY "Authenticated read products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage products" ON products FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'warehouse'));

CREATE POLICY "Authenticated read offers" ON offers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage offers" ON offers FOR ALL TO authenticated USING (get_user_role() = 'admin');

CREATE POLICY "Authenticated read purchases" ON purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage purchases" ON purchases FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'warehouse'));

CREATE POLICY "Authenticated read purchase_items" ON purchase_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage purchase_items" ON purchase_items FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'warehouse'));

CREATE POLICY "Authenticated read cash_registers" ON cash_registers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cashier manage cash_registers" ON cash_registers FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'cashier', 'seller'));

CREATE POLICY "Authenticated read sales" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage sales" ON sales FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'seller', 'cashier'));

CREATE POLICY "Authenticated read sale_items" ON sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage sale_items" ON sale_items FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'seller', 'cashier'));

CREATE POLICY "Authenticated read orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage orders" ON orders FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'seller'));

CREATE POLICY "Authenticated read order_items" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage order_items" ON order_items FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'seller'));

CREATE POLICY "Authenticated read shipments" ON shipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Driver manage own shipments" ON shipments FOR UPDATE TO authenticated
  USING (driver_id = auth.uid() OR get_user_role() = 'admin');

CREATE POLICY "Authenticated read transactions" ON financial_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage transactions" ON financial_transactions FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'cashier'));

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Categorías de ejemplo
INSERT INTO categories (name, description) VALUES
  ('Alimentos', 'Productos alimenticios'),
  ('Bebidas', 'Bebidas y líquidos'),
  ('Limpieza', 'Productos de limpieza'),
  ('Electrónica', 'Dispositivos electrónicos'),
  ('Indumentaria', 'Ropa y accesorios')
ON CONFLICT (name) DO NOTHING;

-- Marcas de ejemplo
INSERT INTO brands (name) VALUES
  ('Sin marca'),
  ('Marca propia'),
  ('Importado')
ON CONFLICT (name) DO NOTHING;

-- Métodos de pago de ejemplo
INSERT INTO payment_methods (name, type, direction) VALUES
  ('Efectivo', 'cash', 'both'),
  ('Transferencia bancaria', 'transfer', 'both'),
  ('Código QR', 'qr', 'income'),
  ('Tarjeta de crédito', 'card', 'income'),
  ('Tarjeta de débito', 'card', 'income')
ON CONFLICT DO NOTHING;

-- ============================================================
-- FUNCIÓN: Auto-crear perfil al registrar usuario
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'seller')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- INSTRUCCIONES POST-SETUP:
-- 1. Ejecutar este SQL completo en Supabase SQL Editor
-- 2. Crear el primer usuario admin desde Authentication > Users
--    (o desde la app en /login usando "Registrarse")
-- 3. Luego actualizar su rol en profiles: 
--    UPDATE profiles SET role = 'admin' WHERE id = '<tu-user-id>';
-- ============================================================
