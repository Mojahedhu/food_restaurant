import NextAuth, { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { client, writeClient } from "@/sanity/lib/client";
import bcrypt from "bcryptjs";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      issuer: "https://accounts.google.com",
      authorization: {
        params: {
          prompt: "select_account consent",
        },
      },
    }),
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Find user in sanity
        const user = await client.fetch(
          `*[_type == "user" && email == $email][0]{
                    _id,
                    email,
                    name,
                    image,
                    password,
                    "role": role->slug.current
                }`,
          { email: credentials.email },
        );

        if (!user) {
          throw new Error("No user found");
        }

        if (!user.password) {
          throw new Error("Please sign in with Google");
        }

        // Verify Password
        const isPasswordMatched = await bcrypt.compare(
          credentials.password as string,
          user.password as string,
        );

        if (!isPasswordMatched) {
          throw new Error("Invalid Password");
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  // 🔥 ADD IT HERE
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exist
          const existingUser = await client.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: user.email },
          );

          if (!existingUser) {
            // Get default role
            const defaultRole = await client.fetch(
              `*[_type == "userRole" && slug.current == "user"][0]{_id }`,
            );

            // Create new user in Sanity with writeClient
            const newUser = {
              _type: "user",
              name: user.name || profile?.name || "User",
              email: user.email,
              image: profile?.picture
                ? {
                    source: "url",
                    url: profile.picture,
                  }
                : undefined,
              provider: "google",
              role: defaultRole
                ? {
                    _type: "reference",
                    _ref: defaultRole._id,
                  }
                : undefined,
              emailVerified: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };

            await writeClient.create(newUser);
          }
        } catch (error) {
          console.error("Error creating user", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
      }
      if (account?.provider === "google") {
        // fetch user from sanity to get role
        const sanityUser = await client.fetch(
          `*[_type == "user" && email == $email][0]{
          _id, 
          "role": role->slug.current,
          "imageUrl": select(
            image.source == "url" => image.url,
            image.source == "asset" => image.asset.asset->url
          )
        }`,
          { email: token.email },
        );
        if (sanityUser) {
          token.id = sanityUser._id;
          token.role = sanityUser.role;
          token.image = sanityUser.imageUrl;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

export { auth as default };
