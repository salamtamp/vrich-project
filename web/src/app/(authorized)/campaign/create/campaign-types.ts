import type { CampaignChannel, CampaignStatus } from '@/types/api';

export type CampaignFormValues = {
  name: string;
  description?: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  channels: CampaignChannel[];
  products: {
    productId: string;
    name: string;
    keyword: string;
    quantity: number;
  }[];
};
