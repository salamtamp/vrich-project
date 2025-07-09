// API response types for each endpoint in API constant

import type { FacebookComment, FacebookCommentResponse } from './facebook-comment';
import type { FacebookInbox, FacebookInboxResponse } from './facebook-inbox';
import type { FacebookPost, FacebookPostResponse } from './facebook-post';
import type { FacebookProfile } from './facebook-profile';

// Generic pagination response type (should match backend)
export type PaginationResponse<T> = {
  total: number;
  docs: T[];
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
  timestamp: boolean;
};

// Generic error response
export type ErrorResponse = { detail: string };

// AUTH.LOGIN
export type AuthLoginApiResponse = {
  200: { access_token: string; token_type: string };
  401: ErrorResponse;
  422: ErrorResponse;
};

// POST.PAGINATION
export type FacebookPostPaginationApiResponse = {
  200: PaginationResponse<FacebookPost>;
  400: ErrorResponse;
  404: ErrorResponse;
};

// PROFILE.PAGINATION
export type FacebookProfilePaginationApiResponse = {
  200: PaginationResponse<FacebookProfile>;
  400: ErrorResponse;
  404: ErrorResponse;
};

// INBOX.PAGINATION
export type FacebookInboxPaginationApiResponse = {
  200: PaginationResponse<FacebookInbox>;
  400: ErrorResponse;
  404: ErrorResponse;
};

// COMMENT.PAGINATION
export type FacebookCommentPaginationApiResponse = {
  200: PaginationResponse<FacebookComment>;
  400: ErrorResponse;
  404: ErrorResponse;
};

// NOTIFICATIONS.LATEST
export type NotificationsApiResponse = {
  posts: FacebookPostResponse[];
  messages: FacebookInboxResponse[];
  comments: FacebookCommentResponse[];
};
