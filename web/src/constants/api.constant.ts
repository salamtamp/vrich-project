export const API = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
  },
  POST: '/api/v1/facebook-posts',
  PROFILE: '/api/v1/facebook-profiles',
  INBOX: '/api/v1/facebook-inboxes',
  COMMENT: '/api/v1/facebook-comments',
  NOTIFICATIONS: {
    GET_LAST: '/api/v1/notifications/latest',
    CLEAR: '/api/v1/notifications/clear',
  },
  CAMPAIGN: '/api/v1/campaigns',
  CAMPAIGN_WITH_PRODUCTS_POST: '/api/v1/campaigns/with-products',
  CAMPAIGN_WITH_PRODUCTS_PUT: (id: string) => `/api/v1/campaigns/with-products/${id}`,
  PRODUCTS: '/api/v1/products',
  CAMPAIGNS_PRODUCTS: '/api/v1/campaigns-products',
};
