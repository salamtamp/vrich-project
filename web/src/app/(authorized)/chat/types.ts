import type { FacebookProfileResponse } from '@/types/api/facebook-profile';

export type ChatListItem = {
  id: string;
  source: 'inbox' | 'comment';
  profile?: FacebookProfileResponse;
  message?: string | null;
  published_at: string;
  notificationCount?: number;
};
