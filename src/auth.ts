import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { isAdminEmail } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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
  interface User {
    role?: string;
  }
}

const googleId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleSecret =
  process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

// ONE auth config for the whole app. The route file only re-exports its handlers.
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/account/login",
    error: "/account/login",
  },
  providers: [
    ...(googleId && googleSecret
      ? [
          Google({
            clientId: googleId,
            clientSecret: googleSecret,
            // allowDangerousEmailAccountLinking is intentionally NOT set:
            // sign-up does not verify email ownership, so auto-linking a Google
            // login to an existing password account could be abused.
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
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = String(credentials.email).toLowerCase().trim();

        // Slow down password guessing: per email and per IP
        const ip = getClientIp(request);
        if (
          !rateLimit(`login-email:${normalizedEmail}`, 10, 15 * 60 * 1000).ok ||
          !rateLimit(`login-ip:${ip}`, 30, 15 * 60 * 1000).ok
        ) {
          return null;
        }

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
          name: user.name || "Customer",
          email: user.email,
          role: user.role || "customer",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Admin is decided by the single admin email (see lib/admin.ts)
        token.role = isAdminEmail(user.email)
          ? "admin"
          : user.role || "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as string) || "customer";
      }
      return session;
    },
  },
  // No hardcoded fallback: Auth.js reads AUTH_SECRET (or NEXTAUTH_SECRET) itself,
  // and refuses to run in production if it is missing.
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
