export const API = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
  },
  POST: '/api/v1/facebook-posts',
  PROFILE: '/api/v1/facebook-profiles',
  INBOX: '/api/v1/facebook-inboxes',
  COMMENT: '/api/v1/facebook-comments',
  COMMENT_TIMELINE: '/api/v1/facebook-comments/timeline',
  NOTIFICATIONS: {
    GET_LAST: '/api/v1/notifications/latest',
    CLEAR: '/api/v1/notifications/clear',
  },
  CAMPAIGN: '/api/v1/campaigns',
  CAMPAIGN_WITH_PRODUCTS_POST: '/api/v1/campaigns/with-products',
  CAMPAIGN_WITH_PRODUCTS_PUT: (id: string) => `/api/v1/campaigns/with-products/${id}`,
  PRODUCTS: '/api/v1/products',
  PRODUCTS_UPLOAD_EXCEL: '/api/v1/products/upload-excel',
  CAMPAIGNS_PRODUCTS: '/api/v1/campaigns-products',
  ORDER: '/api/v1/orders',
  PAYMENT: '/api/v1/payments',
  PAYMENT_SLIP_VERIFY: 'https://developer.easyslip.com/api/v1/verify',
  PAYMENT_SLIP_API_TOKEN: '638480ec-7225-4a33-b533-7cc21f994476',
};
