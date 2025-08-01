import type { Campaign } from './campaign';
import type { Product } from './product';

export type CampaignStatus = 'active' | 'inactive';

export type CampaignsProduct = {
  id: string;
  campaign_id: string;
  product_id: string;
  keyword: string;
  quantity: number;
  max_order_quantity?: number;
  status: CampaignStatus;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  campaign: Campaign | null;
  product: Product | null;
};
