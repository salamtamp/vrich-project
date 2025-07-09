import { env } from 'next-runtime-env';

export const serverEnv = {
  baseApiURL: env('BASE_API_URL'),
  otpApiURL: env('OTP_API_URL'),
  nextAuthSecret: env('NEXTAUTH_SECRET'),
};
