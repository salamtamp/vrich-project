export type FacebookComment = {
  profile_id: string;
  post_id: string;
  comment_id: string;
  message?: string;
  published_at: string;
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
