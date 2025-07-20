import type { Product } from './product';

export type CampaignStatus = 'active' | 'inactive';
export type CampaignChannel = 'facebook_comment' | 'facebook_inbox';

export type CampaignProduct = {
  productId: string;
  name: string;
  keyword: string;
  quantity: number;
};

export type Campaign = {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  start_date?: string;
  end_date?: string;
  channels: CampaignChannel[];
  products: CampaignProduct[];
  post_id?: string;
  product?: Product;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
};

export type CampaignCreate = Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'product'>;

export type CampaignResponse = Campaign;
