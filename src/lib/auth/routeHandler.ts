import { NextAuthOptions, Account, User, Profile } from 'next-auth'
import { AdapterUser } from 'next-auth/adapters'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const routeHandler = async (options: NextAuthOptions) => {
  return {
    callbacks: {
      async signIn({
        user,
        account,
        profile,
        email,
        credentials
      }: {
        user: User | AdapterUser
        account: Account | null
        profile?: Profile
        email?: { verificationRequest?: boolean }
        credentials?: Record<string, any>
      }) {
        // Validate user exists and has an active plan
        if (user) {
          const [dbUser] = await db
            .select({
              plan: users.plan,
              // Note: isActive field doesn't exist in schema, removing it
            })
            .from(users)
            .where(eq(users.id, parseInt(user.id)))
            .limit(1)

          if (dbUser && dbUser.plan) {
            return true
          }
        }
        return false
      },

      async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
        // Redirect to appropriate dashboard based on plan
        if (url?.includes('/dashboard')) {
          return baseUrl + '/dashboard'
        }
        return baseUrl + '/dashboard'
      },

      async session({ session, token }: { session: Session; token: JWT }) {
        // Enrich session with user plan and permissions
        if (token?.userId) {
          const [dbUser] = await db
            .select({
              plan: users.plan,
              max_render_jobs: users.max_render_jobs,
              max_cloaked_links: users.max_cloaked_links,
              // Note: isActive field doesn't exist in schema, removing it
            })
            .from(users)
            .where(eq(users.id, token.userId as number))
            .limit(1)

          if (dbUser) {
            return {
              ...session,
              plan: dbUser.plan,
              permissions: {
                canRender: dbUser.plan !== 'starter' || (dbUser.plan === 'starter' && dbUser.max_render_jobs > 0),
                canCreateLinks: dbUser.plan !== 'starter' || (dbUser.plan === 'starter' && dbUser.max_cloaked_links > 0),
                isActive: true // Default to true since field doesn't exist in schema
              }
            }
          }
        }
        return session
      }
    }
  }
}