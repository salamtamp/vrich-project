import type { FacebookPostResponse } from './facebook-post';
import type { FacebookProfileResponse } from './facebook-profile';

export type FacebookComment = {
  profile_id: string;
  post_id: string;
  comment_id: string;
  message?: string;
  published_at: string;
  profile?: FacebookProfileResponse;
  post?: FacebookPostResponse;
};

export type FacebookCommentUpdate = Partial<Pick<FacebookComment, 'message' | 'published_at'>> & {
  deleted_at?: string;
};

export type FacebookCommentResponse = FacebookComment & {
  id: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
};
