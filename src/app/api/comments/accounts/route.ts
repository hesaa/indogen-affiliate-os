import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth'
import { z } from 'zod'

// Schema validation for request bodies
const connectAccountSchema = z.object({
  platform: z.enum(['tiktok', 'instagram']).default('tiktok'),
  username: z.string().min(1, 'Username is required'),
  token: z.string().min(1, 'Token is required'),
  profileUrl: z.string().url().optional(),
})

const disconnectAccountSchema = z.object({
  id: z.string().uuid('Invalid account ID'),
})

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = connectAccountSchema.parse(body)

    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: user.id,
        platform: validatedData.platform,
        username: validatedData.username,
      },
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'This account is already connected' },
        { status: 400 }
      )
    }

    const account = await prisma.socialAccount.create({
      data: {
        userId: user.id,
        platform: validatedData.platform,
        username: validatedData.username,
        token: validatedData.token,
        profileUrl: validatedData.profileUrl,
      },
    })

    return NextResponse.json({ account })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid request data' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const validatedData = disconnectAccountSchema.parse({
      id: searchParams.get('id'),
    })

    const account = await prisma.socialAccount.findFirst({
      where: { id: validatedData.id, userId: user.id },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    await prisma.socialAccount.delete({
      where: { id: validatedData.id },
    })

    return NextResponse.json({ message: 'Account disconnected successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid request data' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}