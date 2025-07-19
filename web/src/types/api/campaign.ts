export type CampaignStatus = 'active' | 'inactive';

export type CampaignProduct = {
  productId: string;
  name: string;
  keyword: string;
  quantity: number;
};

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  products: CampaignProduct[];
  start_at?: string;
  end_at?: string;
  created_at: string;
  updated_at?: string;
};

export type CampaignCreate = Omit<Campaign, 'id' | 'created_at' | 'updated_at'>;

export type CampaignResponse = Campaign;
