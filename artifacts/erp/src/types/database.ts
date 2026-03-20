import { UserRole } from "@/lib/supabase";

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Brand {
  id: number;
  name: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category_id: number | null;
  brand_id: number | null;
  purchase_price: number;
  sale_price: number;
  stock: number;
  min_stock: number;
  expiry_date: string | null;
  web_enabled: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  dni: string | null;
  current_account_balance: number;
  is_active: boolean;
  created_at: string;
}

export interface Sale {
  id: number;
  sale_number: string;
  customer_id: number | null;
  subtotal: number;
  discount: number;
  total: number;
  payment_method_id: number | null;
  status: 'completed' | 'cancelled' | 'refunded';
  cash_register_id: number | null;
  notes: string | null;
  created_at: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}
