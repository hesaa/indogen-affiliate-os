import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with selected plan
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        plan,
      },
      select: {
        id: true,
        email: true,
        plan: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    )
  }
}