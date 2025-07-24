import type { CampaignsProduct } from './campaigns_products';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'approved'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'completed';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'paid',
  'approved',
  'shipped',
  'delivered',
  'cancelled',
  'completed',
];

export type OrderProfile = {
  id: string;
  name: string;
  profile_picture_url?: string;
};

export type OrderProduct = {
  id: string;
  order_id: string;
  profile_id: string;
  campaign_product_id: string;
  quantity: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  campaign_product?: CampaignsProduct | null;
};

export type Order = {
  id: string;
  code?: string;
  profile_id: string;
  campaign_id: string;
  status: OrderStatus;
  purchase_date?: string;
  shipping_date?: string;
  delivery_date?: string;
  note?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  profile?: OrderProfile | null;
  orders_products: OrderProduct[];
};

export type OrderResponse = Order;
