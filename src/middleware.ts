import { NextResponse } from 'next/server'
import { auth } from '@lib/auth'
import { prisma } from '@lib/db'

export async function middleware(request: Request) {
  const token = auth(request)
  const pathname = request.nextUrl.pathname

  // Public routes - no authentication required
  const publicRoutes = [
    '/login',
    '/register',
    '/landing',
    '/api/auth/callback',
    '/api/auth/register',
  ]

  // Check if route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token?.user?.email) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: token.user.email },
    select: { plan: true },
  })

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Routes that require authentication (all authenticated users can access)
  const authRoutes = [
    '/dashboard',
    '/dashboard/(render|links|comments|landing-pages)',
    '/api/render',
    '/api/links',
    '/api/comments',
    '/api/landing-pages',
  ]

  // Check if route requires authentication
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // If we reach here, the route is not recognized
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|login|register|landing).*)'],
}