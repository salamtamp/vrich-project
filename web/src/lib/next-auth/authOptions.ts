import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { serverEnv } from '@/constants/env/server-env';
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
        const { id, ...restUser } = user;
        return { ...token, userId: id, ...restUser };
      }

      if (token.expires && dayjs().isBefore(dayjs(token.expires))) {
        return token;
      }

      return { ...token, error: 'AccessTokenIsExpiredError' };
    },
    session({ session, token }) {
      session.user = {
        email: token.email,
      };
      session.accessToken = token.accessToken;
      session.expiredAt = token.expiredAt;
      session.expires = token.expires;
      session.error = token.error;

      return session;
    },
    redirect({ baseUrl }) {
      return baseUrl;
    },
  },
};
