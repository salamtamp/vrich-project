/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { DefaultUser } from 'next-auth';

type Permission = string;

type AuthUser = {
  email: string;
};

declare module 'next-auth' {
  interface Session {
    user: AuthUser;
    accessToken: string;
    expiredAt: string;
    expires: number;

    error?: 'AccessTokenIsExpiredError' | 'AccessTokenError' | null;
  }

  interface User extends DefaultUser {
    email: string;
    accessToken: string;
    expiredAt: string;
    expires: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    email: string;
    accessToken: string;
    expiredAt: string;
    expires: number;
    error?: 'AccessTokenIsExpiredError' | 'AccessTokenError' | null;
  }
}

export type AuthUserResponse = {
  access_token: string;
  email: string;
  token_type: string;
};

export type JWTDecodeResponse = {
  sub: string;
  exp: number;
};
