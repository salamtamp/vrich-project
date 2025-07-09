import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { serverEnv } from '@/constants/environment/server-environment';
import dayjs from '@/lib/dayjs';

import { handleSignIn } from './authSignIn';

export const authOptions: NextAuthOptions = {
  pages: { signIn: '/login', error: '/login' },
  secret: serverEnv.nextAuthSecret,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required for authentication.');
        }

        return handleSignIn(credentials.email, credentials.password);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          email: user.email,
          accessToken: user.accessToken,
          expiredAt: user.expiredAt,
          expires: user.expires,
        };
      }

      if (token.expires) {
        const isExpired = dayjs().isAfter(dayjs.unix(token.expires));

        if (isExpired) {
          return {
            ...token,
            error: 'AccessTokenIsExpiredError' as const,
            accessToken: '',
          };
        }
      }

      return token;
    },

    session({ session, token }) {
      if (token.error === 'AccessTokenIsExpiredError') {
        return {
          ...session,
          user: { email: token.email },
          accessToken: '',
          expiredAt: token.expiredAt,
          expires: token.expires,
          error: 'AccessTokenIsExpiredError' as const,
        };
      }

      return {
        ...session,
        user: { email: token.email },
        accessToken: token.accessToken,
        expiredAt: token.expiredAt,
        expires: token.expires,
        error: null,
      };
    },

    redirect({ baseUrl }) {
      return baseUrl;
    },
  },
};
