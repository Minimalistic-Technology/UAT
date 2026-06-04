import NextAuth, { type NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
    providers: [
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID || 'common',
            authorization: {
                params: {
                    scope: "openid profile email offline_access User.Read Files.Read.All",
                },
            },
            httpOptions: {
                timeout: 10000, // Important: Increase timeout because Microsoft's server response can often exceed NextAuth's default 3500ms
            }
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account }) {
            // Persist the access_token on sign in
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
            }
            return token;
        },
        async session({ session, token }) {
            // Send access token to client
            (session as any).accessToken = token.accessToken;
            (session as any).error = token.error;
            return session;
        },
    },
    pages: {
        error: "/auth/error",
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
