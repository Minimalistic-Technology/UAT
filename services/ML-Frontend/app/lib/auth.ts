import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import { Session } from 'next-auth';
import connectDB from './connectDB';
import User from '../models/user';

export interface ExtendedSession extends Session {
  user: {
    id: string;
    jwtToken?: string;
    role?: string;
    email: string;
    name: string;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'email', type: 'text', placeholder: '' },
        password: { label: 'password', type: 'password', placeholder: '' },
      },
      async authorize(credentials: any) {
        if (!credentials) return null;

        await connectDB();

        const userDb = await (User as any).findOne({ email: credentials.username });

        if (
          userDb &&
          userDb.password &&
          (await bcrypt.compare(credentials.password, userDb.password))
        ) {
          return {
            id: userDb._id.toString(),
            name: userDb.name || userDb.email,
            email: userDb.email,
            role: userDb.role || 'user',
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      const customSession = session as ExtendedSession;
      if (token) {
        customSession.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string | undefined,
        };
      }
      return customSession;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any).role;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'secr3t',
  pages: {
    signIn: '/auth/login', // Fixed: was '/logIn' (404), now points to actual login page
  },
};
