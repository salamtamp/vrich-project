import { env } from 'next-runtime-env';

export const publicEnv = {
  refetchInterval: env('NEXT_PUBLIC_REFETCH_INTERVAL'),
  baseApiUrl: env('NEXT_PUBLIC_BASE_API_URL'),
};
