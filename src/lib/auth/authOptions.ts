import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextAuthOptions } from 'next-auth'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: string
      plan: string
    }
  }

  interface User {
    id: string
    email: string
    role: string
    plan: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user?: {
      id: string
      email: string
      role: string
      plan: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1)

        if (!user) {
          return null
        }

        const { comparePassword } = await import('@/lib/auth')
        const isPasswordValid = await comparePassword(credentials.password, user.password_hash)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role || 'user',
          plan: user.plan || 'starter'
        }
      }
    }),

    // TODO: Add OAuth providers when needed
    // Example: TikTok, Instagram, etc.
  ],

  callbacks: {
    // Create user if they don't exist (first-time OAuth login)
    async signIn({ user, account, profile }) {
      if (account?.type === 'oauth') {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!))
          .limit(1)

        if (!existingUser) {
          // Create new user with default password
          // TODO: Generate a secure random password
          await db.insert(users).values({
            email: user.email!,
            password_hash: Math.random().toString(36),
            role: 'user',
            plan: 'starter'
          })
        }
      }

      return true
    },

    // Add user data to JWT token
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email!,
          role: user.role,
          plan: user.plan
        }
      }
      return token
    },

    // Add user data to session
    async session({ session, token }) {
      if (token?.user) {
        session.user = {
          id: token.user.id,
          email: token.user.email,
          role: token.user.role,
          plan: token.user.plan
        }
      }
      return session
    }
  },

  // Session configuration
  session: {
    strategy: 'jwt'
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET!
  },

  // Pages configuration
  pages: {
    signIn: '/auth/login',
  },

  // Debug mode
  debug: process.env.NODE_ENV === 'development'
}