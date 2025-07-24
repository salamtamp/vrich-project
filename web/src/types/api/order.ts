import type { CampaignsProduct } from './campaigns_products';
import type { FacebookProfile } from './facebook-profile';

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

export const ORDER_PROCESS_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'paid',
  'approved',
  'shipped',
  'delivered',
  'completed',
];

// Deprecated: Use FacebookProfileResponse instead for profile
// export type OrderProfile = {
//   id: string;
//   name: string;
//   profile_picture_url?: string;
// };

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

export type Order = OrderResponse;

export type Payment = {
  id: string;
  profile_id: string;
  order_id: string;
  payment_code: string;
  payment_slip?: string | null;
  payment_date?: string | null;
  amount: number;
  method: string;
  status: string;
  note?: string | null;
  refund_id?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
};

export type OrderResponse = {
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
  profile?: FacebookProfile;
  orders_products: OrderProduct[];
  payments: Payment[];
};
