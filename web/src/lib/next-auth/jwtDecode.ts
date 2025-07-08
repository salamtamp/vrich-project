import { jwtDecode } from 'jwt-decode';

import type { JWTDecodeResponse } from '@/types/next-auth';

export const decodeAccessToken = (accessToken: string): JWTDecodeResponse | null => {
  try {
    return jwtDecode<JWTDecodeResponse>(accessToken);
  } catch (error) {
    console.error('AccessToken decoding error:', error);
    return null;
  }
};
