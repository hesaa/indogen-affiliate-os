import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { TikTokProvider } from 'next-auth/providers'
import { prisma } from '@/lib/db'
import { NextAuthOptions } from 'next-auth'

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || user.password !== credentials.password) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan
        }
      }
    }),

    // TikTok OAuth for comment sniper
    TikTokProvider({
      clientId: process.env.TIKTOK_CLIENT_ID!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'user.read.basic,user.read.email'
        }
      }
    }),

    // Instagram OAuth for comment sniper
    // Note: Instagram requires Meta App setup with Facebook Login
    // This is a placeholder - actual implementation may vary
    {
      id: 'instagram',
      name: 'Instagram',
      type: 'oauth',
      version: '2.0',
      scope: 'user_profile,user_media',
      params: { grant_type: 'authorization_code' },
      accessTokenUrl: 'https://graph.instagram.com/oauth/access_token',
      authorizationUrl: 'https://www.instagram.com/accounts/oauth/authorize/',
      profileUrl: 'https://graph.instagram.com/me',
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email
        }
      }
    }
  ],

  callbacks: {
    // Create user if they don't exist (first-time OAuth login)
    async signIn({ user, account, profile }) {
      if (account?.type === 'oauth') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (!existingUser) {
          const createdUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || user.email!,
              role: 'user',
              plan: 'Starter'
            }
          })
          return createdUser
        }
      }

      return true
    },

    // Add user data to session
    async session({ session, token }) {
      if (token?.user) {
        session.user = {
          id: token.user.id,
          name: token.user.name,
          email: token.user.email,
          role: token.user.role,
          plan: token.user.plan
        }
      }
      return session
    }
  },

  // Database adapter for NextAuth
  adapter: NextAuth.adapters.prisma({
    prisma: prisma
  }),

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
    signUp: '/auth/register'
  },

  // Debug mode
  debug: process.env.NODE_ENV === 'development'
}