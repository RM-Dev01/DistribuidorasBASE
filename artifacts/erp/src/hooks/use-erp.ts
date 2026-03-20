import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Product, Customer, Sale, Category, Brand } from "@/types/database";

// --- Products ---
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select(`
        *,
        categories (name),
        brands (name)
      `).order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct: Partial<Product>) => {
      const { data, error } = await supabase.from("products").insert([newProduct]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

// --- Categories & Brands ---
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) return []; // Fallback to empty if table doesn't exist
      return data as Category[];
    },
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("*").order("name");
      if (error) return [];
      return data as Brand[];
    },
  });
}

// --- Customers ---
export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").order("name");
      if (error) throw error;
      return data as Customer[];
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCustomer: Partial<Customer>) => {
      const { data, error } = await supabase.from("customers").insert([newCustomer]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}

// --- Sales (POS) ---
export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales").select(`
        *,
        customers (name)
      `).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

interface CreateSalePayload {
  sale: Partial<Sale>;
  items: Partial<any>[]; // any for simplicity in this generated code
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSalePayload) => {
      // 1. Insert Sale
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert([payload.sale])
        .select()
        .single();
      
      if (saleError) throw saleError;
      
      // 2. Insert Items
      const itemsToInsert = payload.items.map(item => ({
        ...item,
        sale_id: saleData.id
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Update stock (Simplistic approach, should ideally be an RPC/Trigger)
      for (const item of payload.items) {
        if (item.product_id && item.quantity) {
          const { data: prod } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
          if (prod) {
            await supabase.from("products").update({ stock: prod.stock - item.quantity }).eq("id", item.product_id);
          }
        }
      }

      return saleData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// --- Dashboard Stats (Simulated via raw queries for now) ---
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const [salesRes, productsRes, customersRes] = await Promise.all([
        supabase.from("sales").select("total").gte("created_at", todayStr),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
      ]);

      const todaySales = salesRes.data?.reduce((sum, s) => sum + (s.total || 0), 0) || 0;
      
      return {
        todaySales,
        todaySalesCount: salesRes.data?.length || 0,
        totalProducts: productsRes.count || 0,
        totalCustomers: customersRes.count || 0,
      };
    }
  });
}
