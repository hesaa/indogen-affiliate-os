import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, plan } = await request.json()

    // Validate input
    if (!email || !password || !plan) {
      return NextResponse.json(
        { error: 'Email, password, and plan are required' },
        { status: 400 }
      )
    }

    // Validate plan
    const validPlans = ['starter', 'pro', 'empire']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with selected plan
    const [user] = await db
      .insert(users)
      .values({
        email,
        password_hash: hashedPassword,
        plan,
        role: 'user',
      })
      .returning()

    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    )
  }
}