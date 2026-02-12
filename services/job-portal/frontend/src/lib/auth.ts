import { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    token: string;
    image?: string;
  }

  interface Session {
    user: User & {
      role: string;
      accessToken: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          if (response.data.success) {
            return {
              id: response.data.user.id,
              email: response.data.user.email,
              name: `${response.data.user.firstName} ${response.data.user.lastName}`,
              role: response.data.user.role,
              token: response.data.token,
              image: response.data.user.avatar,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).token;
      }

      // Handle Google OAuth
      if (account?.provider === 'google') {
        try {
          const response = await axios.post(`${API_URL}/auth/google`, {
            googleId: account.providerAccountId,
            email: user?.email,
            firstName: user?.name?.split(' ')[0],
            lastName: user?.name?.split(' ')[1] || '',
            avatar: user?.image,
          });

          if (response.data.success) {
            token.role = response.data.user.role;
            token.accessToken = response.data.token;
          }
        } catch (error) {
          console.error('Google auth error:', error);
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};