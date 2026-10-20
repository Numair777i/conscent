import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const { GET, POST } = handlers;
