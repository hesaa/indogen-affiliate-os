// src/lib/auth.ts
import { redirect } from 'next/navigation'
import { getSession } from 'next-auth/react'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/authOptions'
import { prisma } from './db'
import type { NextRequest } from 'next'
import type { Session } from 'next-auth'

/**
 * Checks if a user is authenticated and redirects to login if not
 */
export async function requireAuth(request: NextRequest) {
  const session = await getSession({ request })
  if (!session?.user) {
    redirect('/auth/login')
    return false
  }
  return true
}

/**
 * Gets the current authenticated user's data including plan information
 */
export async function getAuthUser(request: NextRequest) {
  const session = await getSession({ request })
  if (!session?.user) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      createdAt: true,
      socialAccounts: {
        select: {
          id: true,
          platform: true,
          username: true,
          createdAt: true,
        },
      },
    },
  })

  return user
}

/**
 * Gets the current session without database query
 */
export async function getCurrentSession(request: NextRequest) {
  return await getSession({ request })
}

/**
 * Middleware function to protect routes based on authentication and plan
 */
export async function authMiddleware(
  request: NextRequest,
  requiredPlan?: 'Starter' | 'Pro' | 'Empire'
) {
  const session = await getSession({ request })
  if (!session?.user) {
    return Response.redirect(new URL('/auth/login', request.url))
  }

  if (requiredPlan) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    })

    if (!user || user.plan !== requiredPlan) {
      return Response.redirect(new URL('/dashboard', request.url))
    }
  }

  return request
}

/**
 * Server action to create a new user session
 */
export async function createSession(email: string, password: string) {
  const session = await getServerSession(authOptions)
  return session
}

/**
 * Server action to destroy the current session
 */
export async function destroySession() {
  const session = await getServerSession(authOptions)
  if (session) {
    await session.destroy()
  }
}