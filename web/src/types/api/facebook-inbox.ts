import type { FacebookProfileResponse } from './facebook-profile';

export type FacebookInbox = {
  profile_id: string;
  messenger_id: string;
  message: string | null;
  type: string;
  link: string | null;
  published_at: string;
  profile?: FacebookProfileResponse;
};

export type FacebookInboxUpdate = Partial<
  Pick<FacebookInbox, 'message' | 'type' | 'link' | 'published_at'>
> & {
  deleted_at?: string;
};

export type FacebookInboxResponse = FacebookInbox & {
  id: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
};
