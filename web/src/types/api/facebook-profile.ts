export type FacebookProfile = {
  facebook_id: string;
  type: 'page' | 'user';
  name: string;
  profile_picture_url: string;
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
