// API response types for each endpoint in API constant

import type { FacebookComment } from './facebook-comment';
import type { FacebookMessenger } from './facebook-messenger';
import type { FacebookPost } from './facebook-post';
import type { FacebookProfile } from './facebook-profile';

// Generic pagination response type (should match backend)
export type PaginationResponse<T> = {
  total: number;
  docs: T[];
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
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

// MESSAGE.PAGINATION
export type FacebookMessengerPaginationApiResponse = {
  200: PaginationResponse<FacebookMessenger>;
  400: ErrorResponse;
  404: ErrorResponse;
};

// COMMENT.PAGINATION
export type FacebookCommentPaginationApiResponse = {
  200: PaginationResponse<FacebookComment>;
  400: ErrorResponse;
  404: ErrorResponse;
};
