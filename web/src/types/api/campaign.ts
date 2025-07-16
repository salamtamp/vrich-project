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
  startAt?: string;
  endAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CampaignCreate = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>;

export type CampaignResponse = Campaign;
