import type { Campaign } from '@/types/api/campaign';

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale',
    status: 'active',
    products: [
      { productId: 'orange', name: 'Orange', keyword: 'fruit', quantity: 100 },
      { productId: 'banana', name: 'Banana', keyword: 'yellow', quantity: 50 },
    ],
    start_at: '2024-06-01T00:00:00Z',
    end_at: '2024-06-30T23:59:59Z',
    created_at: '2024-05-20T10:00:00Z',
    updated_at: '2024-05-25T12:00:00Z',
  },
  {
    id: '2',
    name: 'Winter Promo',
    status: 'inactive',
    products: [{ productId: 'watermelon', name: 'Watermelon', keyword: 'refresh', quantity: 30 }],
    start_at: '2024-12-01T00:00:00Z',
    end_at: '2024-12-31T23:59:59Z',
    created_at: '2024-11-15T09:00:00Z',
    updated_at: '2024-11-20T11:00:00Z',
  },
];
