import type { FacebookProfileContact } from './facebook-profile-contact';

export type FacebookProfile = {
  facebook_id: string;
  type: 'page' | 'user';
  name: string;
  profile_picture_url: string;
  profile_contact?: FacebookProfileContact;
  username?: string;
  bio?: string;
};

export type FacebookProfileUpdate = Partial<FacebookProfile> & {
  deleted_at?: string;
};

export type FacebookProfileResponse = FacebookProfile & {
  id: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
};
