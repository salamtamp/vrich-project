export type FacebookPost = {
  profile_id: string;
  post_id: string;
  message?: string;
  link?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  status: 'active' | 'inactive';
  published_at: string;
};

export type FacebookPostUpdate = Partial<
  Omit<FacebookPost, 'post_id' | 'profile_id' | 'status' | 'published_at'>
> & {
  profile_id?: string;
  message?: string;
  link?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  status?: 'active' | 'inactive';
  published_at?: string;
  deleted_at?: string;
};

export type FacebookPostResponse = FacebookPost & {
  id: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
};
