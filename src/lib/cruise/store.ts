import { supabase } from '../supabase';

export type Product = {
  sku: string;
  name: string;
  kind: string;
  description: string;
  price_ngn: number;
  image: string;
  status: 'preorder' | 'coming' | 'soldout' | string;
  collection: string;
};

export type Variant = { id: number; sku: string; size: string; stock: number };
export type CartItem = { id: number; sku: string; size: string; qty: number };

export async function loadStore() {
  const [{ data: products, error: productsError }, { data: variants, error: variantsError }] = await Promise.all([
    supabase.from('products').select('sku,name,kind,description,price_ngn,image,status,collection').order('created_at', { ascending: false }),
    supabase.from('product_variants').select('id,sku,size,stock').order('id'),
  ]);
  if (productsError) throw productsError;
  if (variantsError) throw variantsError;
  return { products: (products ?? []) as Product[], variants: (variants ?? []) as Variant[] };
}

export async function loadCart() {
  const { data: cart, error: cartError } = await supabase.from('carts').select('id').maybeSingle();
  if (cartError) throw cartError;
  if (!cart) return [] as CartItem[];
  const { data, error } = await supabase.from('cart_items').select('id,sku,size,qty').eq('cart_id', cart.id).order('id');
  if (error) throw error;
  return (data ?? []) as CartItem[];
}

export async function setCartQty(sku: string, size: string, qty: number) {
  const { error } = await supabase.rpc('cruise_set_cart_qty', { p_sku: sku, p_size: size, p_qty: qty });
  if (error) throw error;
  return loadCart();
}

export async function addToCart(sku: string, size: string, qty = 1) {
  const { error } = await supabase.rpc('cruise_add_to_cart', { p_sku: sku, p_size: size, p_qty: qty });
  if (error) throw error;
  return loadCart();
}

export async function placeOrder(input: { name: string; phone: string; address: string; city: string; email?: string }) {
  const { data, error } = await supabase.rpc('cruise_place_order', {
    p_name: input.name,
    p_phone: input.phone,
    p_address: input.address,
    p_city: input.city,
    p_email: input.email ?? null,
  });
  if (error) throw error;
  return data as { orderId: string; total: number; status: string; message: string };
}
