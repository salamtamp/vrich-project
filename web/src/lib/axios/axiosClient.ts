import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

import { publicEnv } from '@/constants/env/public-env';

export const axiosClient: AxiosInstance = axios.create({
  baseURL: publicEnv.baseApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error?.message ?? 'Request failed'));
  }
);

// Response interceptor to handle token refresh
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      return Promise.reject(new Error(error?.message ?? 'Authentication failed'));
    }

    return Promise.reject(new Error(error?.message ?? 'Response failed'));
  }
);

export * from 'axios';
