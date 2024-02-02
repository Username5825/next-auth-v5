import NextAuth from "next-auth"
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";


export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  update,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error", // our custom error page
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
        // ☝️ If logged in using Google or Github, no need to verifyEmail
        // 🔗 https://next-auth.js.org/configuration/events#linkaccount
      })
    }
  },
  callbacks: {
    // ------------- 1️⃣ SIGN IN  ---------
    // 📂 actions/login.ts
    async signIn({ user, account }) {
      // 1. Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      // 2.Without OAuth (=> credentials)
      const existingUser = await getUserById(user.id);

      if (!existingUser?.emailVerified) return false; // 📩

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id }
        });
      }

      return true;
    },
    // ------------- 2️⃣ SESSION ---------
    // 📂
    async session({ token, session }) {
      console.log("📂 auth.ts -> SESSION) ", session)  // 💻
      console.log("📂 auth.ts -> TOKEN(jwt) ", token)  // 💻
      //💡 token.sub is the User ID *
      // => (cf. Neon.tech Tables or npx prisma studio)

      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole; // ADMIN or USER
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.isOAuth = token.isOAuth as boolean;
      }

      return session;
    },
    // ------------- 3️⃣ JWT (Json Web Token) ---------
    // 📂
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(
        existingUser.id
      );

      token.isOAuth = !!existingAccount; //💡 boolean
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
