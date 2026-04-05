import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { API_URL } from "@/constants";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        try {
          let response;
          if (credentials?.otp) {
            response = await axios.post(`${API_URL}/auth/register/confirm`, {
              email: credentials.email,
              otp: credentials.otp,
            });
          } else {
            response = await axios.post(`${API_URL}/auth/login`, {
              email: credentials?.email,
              password: credentials?.password,
            });
          }

          if (response.data.success) {
            const user = response.data.data;

            return {
              id: user.id || user._id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
              token: user.token,
              image: user.avatar,

              isEmployee: user.isEmployee ?? false,
              companyId: user.companyId ? user.companyId.toString() :  null,
              companyRole: user.companyRole ?? null,
            };
          }
          return null;
        } catch (error: unknown) {
          console.log("error response", error);

          let message: string | undefined;

          if (axios.isAxiosError(error)) {
            // Server responded with a status code (4xx, 5xx)
            if (error.response) {
              const data = error.response.data;

              if (typeof data === "object" && data !== null) {
                if ("errors" in data && Array.isArray((data as any).errors)) {
                  message = (data as any).errors
                    .map((e: any) => e.msg)
                    .join(", ");
                } else if (
                  "message" in data &&
                  typeof (data as any).message === "string"
                ) {
                  message = (data as any).message;
                }
              }

              if (!message) {
                message = `Request failed with status ${error.response.status}`;
              }
            }
            // Request made but no response received (network error, CORS, server down)
            else if (error.request) {
              message = "Network error. Please check your internet connection.";
            }
            // Something happened before request was sent
            else {
              message = error.message || "Unexpected request error occurred.";
            }
          }
          // Native JS error (non-Axios)
          else if (error instanceof Error) {
            message = error.message;
          }

          // Final fallback
          if (!message) {
            message = "Something went wrong. Please try again.";
          }

          throw new Error(message);
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
        token.id = user.id;
        token.role = (user as any).role;
        token.accessToken = (user as any).token;
        token.isEmployee = user.isEmployee;
        token.companyId = user.companyId;
        token.companyRole = user.companyRole;
      }

      // Handle Google OAuth
      if (account?.provider === "google") {
        try {
          const response = await axios.post(`${API_URL}/auth/google`, {
            googleId: account.providerAccountId,
            email: user?.email,
            firstName: user?.name?.split(" ")[0],
            lastName: user?.name?.split(" ")[1] || "",
            avatar: user?.image,
          });

          if (response.data.success) {
            const payload = response.data.data;
            token.role = payload.role;
            token.accessToken = payload.token;
          }
        } catch (error) {
          console.error("Google auth error:", error);
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
        session.user.isEmployee = token.isEmployee as boolean;
        session.user.companyId = token.companyId as string | null;
        session.user.companyRole = token.companyRole as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
