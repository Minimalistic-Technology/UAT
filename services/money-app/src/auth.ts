import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      // Runs on initial sign-in only (account is present then).
      if (account && profile?.sub) {
        await connectToDatabase();

        const update: Record<string, unknown> = {
          googleId: profile.sub,
          email: token.email,
          name: token.name,
          image: token.picture,
        };
        // Google only returns a refresh_token on the very first consent.
        if (account.refresh_token) {
          update.refreshToken = account.refresh_token;
        }

        const dbUser = await User.findOneAndUpdate(
          { googleId: profile.sub },
          update,
          { upsert: true, new: true }
        );

        token.userId = dbUser._id.toString();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
});
