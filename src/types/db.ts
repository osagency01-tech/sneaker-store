/* ==================================================================== *
 *  Types applicatifs — reflètent le schéma Supabase (voir migrations).
 *  Source de vérité unique côté TypeScript.
 * ==================================================================== */

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type ProductStatus = "active" | "draft" | "archived";

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  price: number;                 // en XOF, entier (pas de centimes)
  compare_at_price: number | null; // prix barré (promo) si renseigné
  category_id: string | null;
  status: ProductStatus;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  position: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;                  // pointure, ex "42"
  sku: string | null;
  stock: number;
};

export type Customer = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string;
  address: string;              // quartier / adresse
  country: string;              // code ISO, ex "CI"
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  access_token: string;         // pour consultation sécurisée sans compte
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;         // snapshot
  size: string;                 // snapshot
  unit_price: number;           // snapshot
  quantity: number;
};

export type Payment = {
  id: string;
  order_id: string;
  provider: string;             // "sebpay"
  external_reference: string;   // clé d'idempotence utilisée pour le polling
  provider_tx_id: string | null;
  amount: number;
  status: PaymentStatus;
  operator: string | null;
  created_at: string;
};

/* Vues composées, pratiques côté UI */
export type ProductWithRelations = Product & {
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category | null;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
  customer: Customer | null;
  payment: Payment | null;
};
