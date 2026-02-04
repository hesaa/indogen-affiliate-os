// src/lib/auth.ts
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/authOptions'
import { db } from './db'
import { users, social_accounts } from './db/schema'
import { eq } from 'drizzle-orm'
import type { Session } from 'next-auth'
import bcrypt from 'bcryptjs'

/**
 * Hashes a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

/**
 * Compares a plain text password with a hashed password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Gets the current server session
 * Use this in Server Components, Route Handlers, and Server Actions
 */
export async function auth(): Promise<Session | null> {
  return await getServerSession(authOptions)
}

/**
 * Checks if a user is authenticated and redirects to login if not
 * Use this in Server Components or Server Actions
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return session
}

/**
 * Gets the current authenticated user's data including plan information
 * Returns null if not authenticated
 */
export async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Get user data
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      plan: users.plan,
      role: users.role,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)))
    .limit(1)

  if (!user) return null

  // Get social accounts separately
  const socialAccounts = await db
    .select({
      id: social_accounts.id,
      platform: social_accounts.platform,
      username: social_accounts.username,
      created_at: social_accounts.created_at,
    })
    .from(social_accounts)
    .where(eq(social_accounts.user_id, user.id))

  return {
    ...user,
    socialAccounts,
  }
}

/**
 * Checks if user has required plan
 * Returns true if user has the required plan or higher
 */
export async function hasRequiredPlan(
  requiredPlan: 'starter' | 'pro' | 'empire'
): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false

  const [user] = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)))
    .limit(1)

  if (!user) return false

  // Plan hierarchy: starter < pro < empire
  const planHierarchy = { starter: 1, pro: 2, empire: 3 }
  const userPlanLevel = planHierarchy[user.plan as keyof typeof planHierarchy] || 0
  const requiredPlanLevel = planHierarchy[requiredPlan]

  return userPlanLevel >= requiredPlanLevel
}

/**
 * Middleware helper to check authentication and plan
 * Use this in middleware.ts or route handlers
 */
export async function checkAuth(requiredPlan?: 'starter' | 'pro' | 'empire') {
  const session = await auth()

  if (!session?.user) {
    return {
      authenticated: false,
      authorized: false,
      session: null,
    }
  }

  if (requiredPlan) {
    const authorized = await hasRequiredPlan(requiredPlan)
    return {
      authenticated: true,
      authorized,
      session,
    }
  }

  return {
    authenticated: true,
    authorized: true,
    session,
  }
}

/**
 * Get user by email (for authentication purposes)
 * @internal - Use with caution, mainly for auth flows
 */
export async function getUserByEmail(email: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      password_hash: users.password_hash,
      role: users.role,
      plan: users.plan,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  return user || null
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      plan: users.plan,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  return user || null
}