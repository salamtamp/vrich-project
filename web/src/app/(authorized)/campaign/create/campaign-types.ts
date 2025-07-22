import type { CampaignChannel, CampaignStatus } from '@/types/api';

export type CampaignFormValues = {
  id?: string;
  name: string;
  description?: string;
  status?: CampaignStatus;
  startDate: string;
  endDate: string;
  channels: CampaignChannel[];
  postId?: string;
  facebookComment?: string;
  products: {
    productId: string;
    name: string;
    keyword: string;
    quantity: number;
  }[];
};
