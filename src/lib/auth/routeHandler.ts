import { NextAuthOptions } from 'next-auth'
import { Session } from 'next-auth'
import { User } from '@/lib/db/schema'
import { prisma } from '@/lib/db'

export const routeHandler = async (options: NextAuthOptions) => {
  return {
    callbacks: {
      async signIn({ user, account, profile, email, credentials }) {
        // Validate user exists and has an active plan
        if (user) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { plan: true, isActive: true }
          })

          if (dbUser && dbUser.isActive && dbUser.plan) {
            return true
          }
        }
        return false
      },

      async redirect({ url, baseUrl }) {
        // Redirect to appropriate dashboard based on plan
        if (url?.includes('/dashboard')) {
          return baseUrl + '/dashboard'
        }
        return baseUrl + '/dashboard'
      },

      async session({ session, token }) {
        // Enrich session with user plan and permissions
        if (token?.userId) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.userId },
            select: {
              plan: true,
              maxRenderJobs: true,
              maxCloakedLinks: true,
              isActive: true
            }
          })

          if (dbUser) {
            return {
              ...session,
              plan: dbUser.plan,
              permissions: {
                canRender: dbUser.plan !== 'Starter' || (dbUser.plan === 'Starter' && dbUser.maxRenderJobs > 0),
                canCreateLinks: dbUser.plan !== 'Starter' || (dbUser.plan === 'Starter' && dbUser.maxCloakedLinks > 0),
                isActive: dbUser.isActive
              }
            }
          }
        }
        return session
      }
    }
  }
}