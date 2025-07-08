import axios from 'axios';
import type { User } from 'next-auth';

import { API } from '@/constants/api.constant';
import { serverEnv } from '@/constants/env/server-env';
import dayjs from '@/lib/dayjs';
import type { AuthUserResponse } from '@/types/next-auth';

import { decodeAccessToken } from './jwtDecode';

export const handleSignIn = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await axios.post<AuthUserResponse>(
      `${serverEnv.baseApiURL}${API.AUTH.LOGIN}`,
      {
        email,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const decodedToken = decodeAccessToken(response.data.access_token);

    if (!decodedToken) {
      throw new Error('Invalid token received from server.');
    }

    return {
      accessToken: response.data.access_token,
      id: response.data.email,
      email: response.data.email,
      expiredAt: dayjs(decodedToken.exp * 1000).toISOString(),
      expires: decodedToken.exp * 1000,
    };
  } catch (error) {
    console.error('SignIn error:', error);

    if (!axios.isAxiosError(error)) {
      throw new Error('Failed to sign in with email and password.');
    }

    if (error.response?.status === 401) {
      throw new Error('Invalid email or password.');
    }
    if (error.response?.status === 403) {
      throw new Error('Access denied. Please contact your administrator.');
    }

    throw new Error('Server error. Please try again later.');
  }
};
