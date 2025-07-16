import { API } from '@/constants/api.constant';
import type { CampaignCreate, CampaignResponse } from '@/types/api/campaign';

import useRequest from './useRequest';

export const useCampaignRequest = () =>
  useRequest<CampaignResponse, CampaignCreate>({
    request: {
      url: API.CAMPAIGN,
      method: 'POST',
    },
  });
