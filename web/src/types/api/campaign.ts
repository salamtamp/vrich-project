import type { CampaignsProduct } from './campaigns_products';
import type { FacebookPostResponse } from './facebook-post';

export type CampaignStatus = 'active' | 'inactive';
export type CampaignChannel = 'facebook_comment' | 'facebook_inbox';

export type Campaign = {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  start_date?: string;
  end_date?: string;
  channels: CampaignChannel[];
  campaigns_products: CampaignsProduct[];
  post_id?: string;
  post?: FacebookPostResponse;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
};

export type CampaignCreate = Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'product'>;

export type CampaignResponse = Campaign;
