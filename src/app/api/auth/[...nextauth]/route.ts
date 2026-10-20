import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";

// Extend session user types inline
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    ...(process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
      ? [
          Google({
            clientId: (process.env.AUTH_GOOGLE_ID ||
              process.env.GOOGLE_CLIENT_ID ||
              "") as string,
            clientSecret: (process.env.AUTH_GOOGLE_SECRET ||
              process.env.GOOGLE_CLIENT_SECRET ||
              "") as string,
          }),
        ]
      : []),
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = String(credentials.email).toLowerCase().trim();
        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection("users").findOne({
          email: normalizedEmail,
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          String(credentials.password),
          String(user.password),
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name || "Fragrance Patron",
          email: user.email,
          role: user.role || "customer",
        };
      },
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "conscent-secret-key-123456",
  pages: {
    signIn: "/account/login",
    error: "/account/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const { GET, POST } = handlers;
