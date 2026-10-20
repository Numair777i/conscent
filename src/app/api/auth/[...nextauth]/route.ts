import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: (process.env.AUTH_GOOGLE_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        "") as string,
      clientSecret: (process.env.AUTH_GOOGLE_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET ||
        "") as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          await connectDB();

          // Auto-enroll Google-verified user to Subscriber collection
          await Subscriber.findOneAndUpdate(
            { email: user.email.toLowerCase() },
            {
              $set: {
                email: user.email.toLowerCase(),
                name: user.name || "Fragrance Enthusiast",
                isVerified: true,
                source: "google_oauth",
                subscribedAt: new Date(),
              },
            },
            { upsert: true, new: true },
          );
        } catch (error) {
          console.error("Error auto-subscribing Google user:", error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/account/login",
    error: "/account/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const { GET, POST } = handlers;
